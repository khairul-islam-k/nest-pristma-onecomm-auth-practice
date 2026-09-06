import { BadGatewayException, HttpException, HttpStatus, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { IssuePathaoTokenDto, PathaoEnvironment } from './dto/Issue-pathao-token-dto';
import { HttpService } from '@nestjs/axios';
import { AxiosError, isAxiosError } from 'axios';
import { CourierEnvironment } from 'src/generated/prisma/enums';
import { CreatePathaoStoreDto } from './dto/create-pathao-store-dto';
import type { PathaoAreaErrorResponse, PathaoAreaListResponse, PathaoCityErrorResponse, PathaoCityListResponse, PathaoCreateOrderResponse, PathaoCreateStoreResponse, PathaoOrderErrorResponse, PathaoOrderInfoErrorResponse, PathaoOrderInfoResponse, PathaoZoneErrorResponse, PathaoZoneListResponse } from './interfaces/pathao.type';
import { CreatePathaoOrderDto } from './dto/create-pathao-order.dto';

type PathaoTokenResponse = {
  token_type: 'Bearer';
  expires_in: number;
  access_token: string;
  refresh_token: string;
};

type PathaoErrorResponse = {
  message?: string;
  error?: string;
  errors?: { name: string[] };
};

type PathaoCreateOrderPayload = {
  store_id: number;
  merchant_order_id?: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_secondary_phone?: string;
  recipient_address: string;
  recipient_city?: number;
  recipient_zone?: number;
  recipient_area?: number;
  delivery_type: 48 | 12;
  item_type: 1 | 2;
  special_instruction?: string;
  item_quantity: number;
  item_weight: number;
  item_description?: string;
  amount_to_collect: number;
};

@Injectable()
export class CourierService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async issueAndStorePathaoToken(dto: IssuePathaoTokenDto) {
    const baseUrl = this.getPathaoBaseUrl(dto.environment);

    try {
      const response =
        await this.httpService.axiosRef.post<PathaoTokenResponse>(
          `${baseUrl}/aladdin/api/v1/issue-token`,
          {
            client_id: dto.clientId,
            client_secret: dto.clientSecret,
            grant_type: dto.grantType,
            username: dto.username,
            password: dto.password,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            timeout: 15000,
          },
        );

      const { token_type, expires_in, access_token, refresh_token } = response.data;

      if (!token_type || !expires_in || !access_token || !refresh_token) {
        throw new BadGatewayException(
          'Pathao returned an incomplete token response.',
        );
      }

      const issuedAt = new Date();

      const accessTokenExpiresAt = new Date(
        issuedAt.getTime() + expires_in * 1000,
      );

      const courierToken = await this.prisma.courierToken.upsert({
        where: {
          provider_environment: {
            provider: 'PATHAO',
            environment: dto.environment,
          },
        },
        create: {
          provider: 'PATHAO',
          environment: dto.environment,
          tokenType: token_type,
          accessToken: access_token,
          refreshToken: refresh_token,
          expiresIn: expires_in,
          accessTokenExpiresAt,
          lastIssuedAt: issuedAt,
        },
        update: {
          tokenType: token_type,
          accessToken: access_token,
          refreshToken: refresh_token,
          expiresIn: expires_in,
          accessTokenExpiresAt,
          lastIssuedAt: issuedAt,
        },
        select: {
          id: true,
          provider: true,
          environment: true,
          tokenType: true,
          expiresIn: true,
          accessTokenExpiresAt: true,
          lastIssuedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        status: true,
        message: 'Pathao token issued and stored successfully.',
        data: courierToken,
      };
    } catch (error: unknown) {
      if (error instanceof BadGatewayException) {
        throw error;
      }

      if (error instanceof AxiosError) {
        const responseData = error.response?.data as PathaoErrorResponse;

        throw new BadGatewayException({
          status: false,
          message:
            responseData?.message ??
            responseData?.error ??
            'Failed to issue Pathao token.',
          pathaoStatusCode: error.response?.status,
        });
      }

      throw new InternalServerErrorException({
        status: false,
        message: 'Failed to issue and store Pathao token.',
      });
    }
  }

  async createPathaoStore(dto: CreatePathaoStoreDto) {
    const baseUrl = this.getPathaoBaseUrl(dto.environment);

    const accessToken = await this.getValidPathaoAccessToken(dto.environment);

    const payload = {
      name: dto.name,
      contact_name: dto.contactName,
      contact_number: dto.contactNumber,
      secondary_contact: dto.secondaryContact,
      otp_number: dto.otpNumber,
      address: dto.address,
      city_id: dto.cityId,
      zone_id: dto.zoneId,
      area_id: dto.areaId,
    };

    try {
      const response =
        await this.httpService.axiosRef.post<PathaoCreateStoreResponse>(
          `${baseUrl}/aladdin/api/v1/stores`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            timeout: 15000,
          },
        );

      return {
        status: true,
        message: response.data.message ?? 'Pathao store created successfully.',
        data: response.data.data ?? response.data,
      };
    } catch (error: unknown) {
      if (isAxiosError<PathaoErrorResponse>(error)) {
        const responseData = error.response?.data;

        console.log('response', responseData);

        throw new BadGatewayException({
          status: false,
          errors: responseData?.errors?.name[0],
          message:
            responseData?.message ??
            responseData?.error ??
            responseData?.errors?.name[0] ??
            'Failed to create Pathao store.',
          pathaoStatusCode: error.response?.status,
        });
      }

      throw new InternalServerErrorException({
        status: false,
        message: 'Failed to create Pathao store.',
      });
    }
  }

  async getPathaoCities(pathaoEnvironment: PathaoEnvironment) {
    const baseUrl = this.getPathaoBaseUrl(pathaoEnvironment);

    const accessToken = await this.getValidPathaoAccessToken(pathaoEnvironment);

    try {
      const response =
        await this.httpService.axiosRef.get<PathaoCityListResponse>(
          `${baseUrl}/aladdin/api/v1/city-list`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json; charset=UTF-8',
              Accept: 'application/json',
            },
            timeout: 15000,
          },
        );

      return {
        status: true,
        message:
          response.data.message ?? 'Pathao city list fetched successfully.',
        data: response.data.data.data,
      };
    } catch (error: unknown) {
      if (isAxiosError<PathaoCityErrorResponse>(error)) {
        const responseData = error.response?.data;

        throw new BadGatewayException({
          status: false,
          message:
            responseData?.message ??
            responseData?.error ??
            'Failed to fetch Pathao city list.',
          pathaoStatusCode: error.response?.status,
          errors: responseData?.errors,
        });
      }

      throw new InternalServerErrorException({
        status: false,
        message: 'Failed to fetch Pathao city list.',
      });
    }
  }

  async getPathaoZones(cityId: number, pathaoEnvironment: PathaoEnvironment) {
    const baseUrl = this.getPathaoBaseUrl(pathaoEnvironment);

    const accessToken = await this.getValidPathaoAccessToken(pathaoEnvironment);

    try {
      const response =
        await this.httpService.axiosRef.get<PathaoZoneListResponse>(
          `${baseUrl}/aladdin/api/v1/cities/${cityId}/zone-list`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json; charset=UTF-8',
              Accept: 'application/json',
            },
            timeout: 15000,
          },
        );

      return {
        status: true,
        message:
          response.data.message ?? 'Pathao zone list fetched successfully.',
        data: response.data.data.data,
      };
    } catch (error: unknown) {
      if (isAxiosError<PathaoZoneErrorResponse>(error)) {
        const responseData = error.response?.data;

        throw new BadGatewayException({
          status: false,
          message:
            responseData?.message ??
            responseData?.error ??
            'Failed to fetch Pathao zone list.',
          pathaoStatusCode: error.response?.status,
          errors: responseData?.errors,
        });
      }

      throw new InternalServerErrorException({
        status: false,
        message: 'Failed to fetch Pathao zone list.',
      });
    }
  }

  async createPathaoOrder(dto: CreatePathaoOrderDto) {
    const baseUrl = this.getPathaoBaseUrl(dto.environment);

    const accessToken = await this.getValidPathaoAccessToken(dto.environment);

    const payload: PathaoCreateOrderPayload = {
      store_id: dto.storeId,
      recipient_name: dto.recipientName,
      recipient_phone: dto.recipientPhone,
      recipient_address: dto.recipientAddress,
      delivery_type: dto.deliveryType,
      item_type: dto.itemType,
      item_quantity: dto.itemQuantity,
      item_weight: dto.itemWeight,
      amount_to_collect: dto.amountToCollect,

      ...(dto.merchantOrderId
        ? {
          merchant_order_id: dto.merchantOrderId,
        }
        : {}),

      ...(dto.recipientSecondaryPhone
        ? {
          recipient_secondary_phone: dto.recipientSecondaryPhone,
        }
        : {}),

      ...(dto.recipientCity !== undefined
        ? {
          recipient_city: dto.recipientCity,
        }
        : {}),

      ...(dto.recipientZone !== undefined
        ? {
          recipient_zone: dto.recipientZone,
        }
        : {}),

      ...(dto.recipientArea !== undefined
        ? {
          recipient_area: dto.recipientArea,
        }
        : {}),

      ...(dto.specialInstruction
        ? {
          special_instruction: dto.specialInstruction,
        }
        : {}),

      ...(dto.itemDescription
        ? {
          item_description: dto.itemDescription,
        }
        : {}),
    };

    try {
      const response =
        await this.httpService.axiosRef.post<PathaoCreateOrderResponse>(
          `${baseUrl}/aladdin/api/v1/orders`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            timeout: 15000,
          },
        );

      return {
        status: true,
        message: response.data.message ?? 'Pathao order created successfully.',
        data: response.data.data,
      };
    } catch (error: unknown) {
      if (isAxiosError<PathaoOrderErrorResponse>(error)) {
        const responseData = error.response?.data;

        const pathaoStatusCode =
          error.response?.status ?? HttpStatus.BAD_GATEWAY;

        const responseStatusCode =
          pathaoStatusCode >= 400 && pathaoStatusCode < 500
            ? pathaoStatusCode
            : HttpStatus.BAD_GATEWAY;

        throw new HttpException(
          {
            status: false,
            message:
              responseData?.message ??
              responseData?.error ??
              'Failed to create Pathao order.',
            errors: responseData?.errors,
            pathaoStatusCode,
          },
          responseStatusCode,
        );
      }

      throw new InternalServerErrorException({
        status: false,
        message: 'Failed to create Pathao order.',
      });
    }
  }

  async getPathaoOrderInfo(
    consignmentId: string,
    pathaoEnvironment: PathaoEnvironment,
  ) {
    const baseUrl = this.getPathaoBaseUrl(pathaoEnvironment);

    const accessToken = await this.getValidPathaoAccessToken(pathaoEnvironment);

    try {
      const response =
        await this.httpService.axiosRef.get<PathaoOrderInfoResponse>(
          `${baseUrl}/aladdin/api/v1/orders/${encodeURIComponent(
            consignmentId,
          )}/info`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/json',
            },
            timeout: 15000,
          },
        );

      return {
        status: true,
        message:
          response.data.message ??
          'Pathao order information fetched successfully.',
        data: response.data.data,
      };
    } catch (error: unknown) {
      if (isAxiosError<PathaoOrderInfoErrorResponse>(error)) {
        const responseData = error.response?.data;

        const pathaoStatusCode =
          error.response?.status ?? HttpStatus.BAD_GATEWAY;

        const statusCode =
          pathaoStatusCode >= 400 && pathaoStatusCode < 500
            ? pathaoStatusCode
            : HttpStatus.BAD_GATEWAY;

        throw new HttpException(
          {
            status: false,
            message:
              responseData?.message ??
              responseData?.error ??
              'Failed to fetch Pathao order information.',
            errors: responseData?.errors,
            pathaoStatusCode,
          },
          statusCode,
        );
      }

      throw new InternalServerErrorException({
        status: false,
        message: 'Failed to fetch Pathao order information.',
      });
    }
  }

  async getPathaoAreas(zoneId: number, pathaoEnvironment: PathaoEnvironment) {
    const baseUrl = this.getPathaoBaseUrl(pathaoEnvironment);

    const accessToken = await this.getValidPathaoAccessToken(pathaoEnvironment);

    try {
      const response =
        await this.httpService.axiosRef.get<PathaoAreaListResponse>(
          `${baseUrl}/aladdin/api/v1/zones/${zoneId}/area-list`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json; charset=UTF-8',
              Accept: 'application/json',
            },
            timeout: 15000,
          },
        );

      return {
        status: true,
        message:
          response.data.message ?? 'Pathao area list fetched successfully.',
        data: response.data.data.data,
      };
    } catch (error: unknown) {
      if (isAxiosError<PathaoAreaErrorResponse>(error)) {
        const responseData = error.response?.data;

        throw new BadGatewayException({
          status: false,
          message:
            responseData?.message ??
            responseData?.error ??
            'Failed to fetch Pathao area list.',
          pathaoStatusCode: error.response?.status,
          errors: responseData?.errors,
        });
      }

      throw new InternalServerErrorException({
        status: false,
        message: 'Failed to fetch Pathao area list.',
      });
    }
  }

  private readonly tokenExpiryBufferMs = 5 * 60 * 1000;

  private async getValidPathaoAccessToken(
    environment: CourierEnvironment,
  ): Promise<string> {
    const savedToken = await this.prisma.courierToken.findUnique({
      where: {
        provider_environment: {
          provider: 'PATHAO',
          environment,
        },
      },
    });

    if (!savedToken) {
      throw new UnauthorizedException({
        status: false,
        message: `Issue a Pathao ${environment} access token first.`,
      });
    }

    const minimumValidTime = Date.now() + this.tokenExpiryBufferMs;

    const tokenIsExpiredOrExpiringSoon =
      savedToken.accessTokenExpiresAt.getTime() <= minimumValidTime;

    if (tokenIsExpiredOrExpiringSoon) {
      throw new UnauthorizedException({
        status: false,
        message: `The Pathao ${environment} access token has expired or will expire soon. Issue or refresh the token first.`,
      });
    }

    return savedToken.accessToken;
  }

  private getPathaoBaseUrl(environment: PathaoEnvironment): string {
    switch (environment) {
      case PathaoEnvironment.SANDBOX:
        return 'https://courier-api-sandbox.pathao.com';

      case PathaoEnvironment.LIVE:
        return 'https://api-hermes.pathao.com';

      default:
        throw new InternalServerErrorException('Invalid Pathao environment.');
    }
  }
}
