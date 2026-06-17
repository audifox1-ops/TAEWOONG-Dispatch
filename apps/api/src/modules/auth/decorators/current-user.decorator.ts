import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 현재 로그인한 사용자 정보를 추출하는 데코레이터
 * @example @CurrentUser() user: User
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
