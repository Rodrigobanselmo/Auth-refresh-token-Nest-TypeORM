import { PermissionsGuard } from './shared/guards/permissions.guard';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { UsersModule } from './modules/users/users.module';
import { RolesGuard } from './shared/guards/roles.guard';
import { PrismaModule } from './prisma/prisma.module';
import { TestService } from './modules/test/test.service';
import { TestController } from './module/test/test.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    AuthModule,
    PrismaModule,
  ],
  controllers: [TestController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    TestService,
  ],
})
export class AppModule {}
