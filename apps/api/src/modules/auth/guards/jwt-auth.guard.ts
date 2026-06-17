import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * JWT 인증 가드 (로그인 기능 제거로 인한 우회 처리)
 * 항상 DB의 첫 번째 관리자로 자동 로그인 된 것처럼 처리합니다.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // DB에서 실제 관리자를 가져옵니다. (외래키 제약조건 방지)
    const adminUser = await this.prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (adminUser) {
      request.user = {
        id: adminUser.id,
        loginId: adminUser.loginId,
        name: adminUser.name,
        role: adminUser.role,
      };
    } else {
      request.user = {
        id: 'no-user-id',
        loginId: 'admin',
        name: '최고 관리자',
        role: 'ADMIN',
      };
    }
    
    return true; // 항상 통과
  }
}
