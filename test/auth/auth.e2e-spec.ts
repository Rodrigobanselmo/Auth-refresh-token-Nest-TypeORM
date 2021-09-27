import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { newFakeUser } from '../../src/modules/users/services/users.service.spec';
import request from 'supertest';

import { PrismaModule } from '../../src/prisma/prisma.module';
import { AuthModule } from './../../src/modules/auth/auth.module';
import { LoginUserDto } from './../../src/modules/auth/dto/login-user.dto';
import { CreateUserDto } from './../../src/modules/users/dto/create-user.dto';
import { UpdateUserDto } from './../../src/modules/users/dto/update-user.dto';
import { UsersModule } from './../../src/modules/users/users.module';
import { JwtAuthGuard } from './../../src/shared/guards/jwt-auth.guard';
import { PermissionsGuard } from './../../src/shared/guards/permissions.guard';
import { RolesGuard } from './../../src/shared/guards/roles.guard';

// import faker from 'faker';
// import { PrismaModule } from '../../src/prisma/prisma.module';
// yarn test:e2e

// export const newFakeUser = () => {
//   return {
//     email: faker.internet.email(),
//     password: '123456',
//     roles: [],
//     permissions: [],
//     name: faker.name.findName(),
//   };
// };

const fakeUser = newFakeUser();

describe('[Feature] Auth - /auth', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.test' }),
        PrismaModule,
        UsersModule,
        AuthModule,
      ],
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
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    await app.init();

    await request(app.getHttpServer())
      .post('/users/create')
      .send(fakeUser as CreateUserDto);
  });

  it('Session [POST /session]', async () => {
    const sessionUser: LoginUserDto = {
      email: fakeUser.email,
      password: fakeUser.password,
    };

    // user not found
    await request(app.getHttpServer())
      .post('/auth/session')
      .send({
        ...sessionUser,
        email: 'wrong@notExistent.socm',
      })
      .expect(HttpStatus.NOT_FOUND);

    // wrong password
    await request(app.getHttpServer())
      .post('/auth/session')
      .send({
        ...sessionUser,
        password: 'wrong',
      })
      .expect(HttpStatus.BAD_REQUEST);

    return request(app.getHttpServer())
      .post('/auth/session')
      .send(sessionUser)
      .expect(HttpStatus.CREATED);
  });

  it('Refresh [POST /refresh]', async () => {
    const sessionUser: LoginUserDto = {
      email: fakeUser.email,
      password: fakeUser.password,
    };

    const { body: session } = await request(app.getHttpServer())
      .post('/auth/session')
      .send(sessionUser)
      .expect(HttpStatus.CREATED);

    return request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refresh_token: session.refresh_token })
      .expect(HttpStatus.CREATED);
  });

  afterAll(async () => {
    await app.close();
  });
});
