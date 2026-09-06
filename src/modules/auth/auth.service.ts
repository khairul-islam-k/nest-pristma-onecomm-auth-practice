import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { AuthUser, RefreshAuthUser } from './types/auth-user.type';
import { JwtPayload } from './types/jwt-payload.type';

type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
      },
    });

    const tokens = await this.generateTokenPair({
      id: user.id,
      email: user.email,
    });

    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return {
      user,
      ...tokens,
    };
  }

  async login(user: AuthUser) {
    const tokens = await this.generateTokenPair({
      id: user.id,
      email: user.email,
    });

    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return {
      user,
      ...tokens,
    };
  }

  async refreshToken(user: RefreshAuthUser) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        id: true,
        email: true,
        refreshTokenHash: true,
      },
    });

    if (!existingUser || !existingUser.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isRefreshTokenMatched = await bcrypt.compare(
      user.refreshToken,
      existingUser.refreshTokenHash,
    );

    if (!isRefreshTokenMatched) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokenPair({
      id: existingUser.id,
      email: existingUser.email,
    });

    await this.updateRefreshTokenHash(existingUser.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshTokenHash: null,
      },
    });

    return {
      message: 'Logged out successfully',
    };
  }

  async validateUser(email: string, password: string): Promise<AuthUser> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
        status: 'ACTIVE',
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
    };
  }

  private async generateTokenPair(payload: {
    id: string;
    email: string;
  }): Promise<TokenPair> {
    const accessPayload: JwtPayload = {
      sub: payload.id,
      email: payload.email,
      tokenType: 'access',
    };

    const refreshPayload: JwtPayload = {
      sub: payload.id,
      email: payload.email,
      tokenType: 'refresh',
    };

    const accessExpiresIn =
      this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m';

    console.log('access', accessExpiresIn);

    const refreshExpiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: accessExpiresIn as JwtSignOptions['expiresIn'],
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshExpiresIn as JwtSignOptions['expiresIn'],
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async updateRefreshTokenHash(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const refreshTokenHash = await bcrypt.hash(refreshToken, 12);

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshTokenHash,
      },
    });
  }
}
