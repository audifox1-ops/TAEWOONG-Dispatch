import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
    });
  }

  async onModuleInit() {
    // 애플리케이션 시작 시 DB 연결
    await this.$connect();
  }

  async onModuleDestroy() {
    // 애플리케이션 종료 시 DB 연결 해제
    await this.$disconnect();
  }

  /**
   * 소프트 삭제가 적용된 쿼리 확장
   * deletedAt이 null인 레코드만 조회
   */
  async enableShutdownHooks(app: { close: () => Promise<void> }) {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}
