import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// 전역 모듈로 등록 - 모든 모듈에서 주입 가능
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
