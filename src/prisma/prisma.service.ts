import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// const PrismaClientTest = '../../node_modules/.prisma/test';

// let Client = PrismaClient as any;

// if (process.env.NODE_ENV === 'test')
//   import(PrismaClientTest).then((PrismaClient) => (Client = PrismaClient));

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
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
