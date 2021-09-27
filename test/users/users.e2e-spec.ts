import { UpdateUserDto } from './../../src/modules/users/dto/update-user.dto';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import faker from 'faker';
import request from 'supertest';

import { PrismaModule } from '../../src/prisma/prisma.module';
import { AuthModule } from './../../src/modules/auth/auth.module';
import { LoginUserDto } from './../../src/modules/auth/dto/login-user.dto';
import { CreateUserDto } from './../../src/modules/users/dto/create-user.dto';
import { UsersModule } from './../../src/modules/users/users.module';
import { JwtAuthGuard } from './../../src/shared/guards/jwt-auth.guard';
import { PermissionsGuard } from './../../src/shared/guards/permissions.guard';
import { RolesGuard } from './../../src/shared/guards/roles.guard';

// import { PrismaModule } from '../../src/prisma/prisma.module';
// yarn test:e2e

export const newFakeUser = () => {
  return {
    email: faker.internet.email(),
    password: '123456',
    roles: [],
    permissions: [],
    name: faker.name.findName(),
  };
};

describe('[Feature] Users - /users', () => {
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
  });

  it('Create [POST /create]', async () => {
    await request(app.getHttpServer())
      .post('/users/create')
      .send({ ...newFakeUser(), email: 'rodrigo@com' } as CreateUserDto)
      .expect(HttpStatus.BAD_REQUEST);

    return request(app.getHttpServer())
      .post('/users/create')
      .send(newFakeUser() as CreateUserDto)
      .expect(HttpStatus.CREATED);
  });

  // it('Create with invalid email [POST /create]', () => {
  //   return;
  // });

  it('Get ME [GET /me]', async () => {
    const createUser: CreateUserDto = newFakeUser();
    const sessionUser: LoginUserDto = {
      email: createUser.email,
      password: createUser.password,
    };
    await request(app.getHttpServer()).post('/users/create').send(createUser);

    const { body: session } = await request(app.getHttpServer())
      .post('/auth/session')
      .send(sessionUser);

    await request(app.getHttpServer())
      .get('/users/me')
      .expect(HttpStatus.UNAUTHORIZED);

    return request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${session.token}`)
      .expect(HttpStatus.OK);
  });

  // it('Get me missing token [GET /me]', async () => {
  //   const createUser: CreateUserDto = newFakeUser();
  //   await request(app.getHttpServer()).post('/users/create').send(createUser);

  //   return;
  // });

  // it('Find all [GET /]', async () => {
  //   const createUser: CreateUserDto = newFakeUser();
  //   const sessionUser: LoginUserDto = {
  //     email: createUser.email,
  //     password: createUser.password,
  //   };
  //   const roles_permissions: UpdateUserDto = {
  //     roles: ['admin'],
  //     permissions: ['user.list-all'],
  //   };
  //   await request(app.getHttpServer()).post('/users/create').send(createUser);

  //   const { body: session } = await request(app.getHttpServer())
  //     .post('/auth/session')
  //     .send(sessionUser);

  //   // missing roles and permissions
  //   await request(app.getHttpServer())
  //     .get('/users')
  //     .set('Authorization', `Bearer ${session.token}`)
  //     .expect(HttpStatus.FORBIDDEN);

  //   // updating user roles and permissions
  //   const updatedUser = await request(app.getHttpServer())
  //     .patch(`/users/${session.user.id}`)
  //     .set('Authorization', `Bearer ${session.token}`)
  //     .send({ ...createUser, ...roles_permissions })
  //     .expect(HttpStatus.OK);

  //   console.log(`session.user.id`, updatedUser);
  //   // missing token
  //   await request(app.getHttpServer())
  //     .get('/users')
  //     .expect(HttpStatus.UNAUTHORIZED);

  //   return request(app.getHttpServer())
  //     .get('/users')
  //     .set('Authorization', `Bearer ${session.token}`)
  //     .expect(HttpStatus.CREATED);
  // });

  it.todo('Find all [GET /]');
  it.todo('Find one [GET /:id]');
  it.todo('Update one [PATCH /:id]');
  it.todo('Delete one [DELETE /:id]');

  afterAll(async () => {
    await app.close();
  });
});