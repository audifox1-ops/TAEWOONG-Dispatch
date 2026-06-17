import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DispatchModule } from './modules/dispatch/dispatch.module';
import { ExportModule } from './modules/export/export.module';

@Module({
  imports: [
    // 환경 변수 전역 설정
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    // Prisma DB 연결
    PrismaModule,
    // 인증 모듈
    AuthModule,
    // 사용자 관리 모듈
    UsersModule,
    // 배차지시서 CRUD 모듈
    DispatchModule,
    // 엑셀 내보내기 모듈
    ExportModule,
  ],
})
export class AppModule {}
