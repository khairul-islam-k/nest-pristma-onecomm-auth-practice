import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser, RefreshAuthUser } from '../types/auth-user.type';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser | RefreshAuthUser => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user: AuthUser | RefreshAuthUser }>();

    return request.user;
  },
);
