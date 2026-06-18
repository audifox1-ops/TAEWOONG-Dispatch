import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ensureCoreUsers } from './core-users';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });
  }

  async onModuleInit() {
    // Start DB connection and make sure the core accounts exist.
    await this.$connect();
    await ensureCoreUsers(this);
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
