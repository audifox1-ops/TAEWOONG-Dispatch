import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { requireDatabaseUrl } from '../../prisma/database-url';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      datasources: {
        db: {
          url: requireDatabaseUrl(),
        },
      },
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });
  }

  async onModuleInit() {
    // Prisma connects lazily on the first query in production.
    // Avoid blocking cold starts on DB connectivity during startup.
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async enableShutdownHooks(app: { close: () => Promise<void> }) {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}
