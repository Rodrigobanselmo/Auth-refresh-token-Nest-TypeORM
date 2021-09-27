import { PrismaClient } from '@prisma/client';
import { PrismaClient as PrismaClientTest } from '../../node_modules/.prisma/test';
import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';

let Client = PrismaClient as any;

if (process.env.NODE_ENV === 'test') Client = PrismaClientTest;

@Injectable()
export class PrismaService extends Client implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}

// @Injectable()
// export class PrismaTestService
//   extends PrismaClientTest
//   implements OnModuleInit
// {
//   async onModuleInit() {
//     await this.$connect();
//   }

//   async enableShutdownHooks(app: INestApplication) {
//     this.$on('beforeExit', async () => {
//       await app.close();
//     });
//   }
// }
