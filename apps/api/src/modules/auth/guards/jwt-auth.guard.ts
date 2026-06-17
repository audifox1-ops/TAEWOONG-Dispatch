import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT 인증 가드
 * 보호된 라우트에서 JWT 토큰 검증
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
