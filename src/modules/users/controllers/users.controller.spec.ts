import { UserPayloadDto } from './../../../shared/dto/user-payload.dto';
import { newFakeUser } from './../services/users.service.spec';
import { Test, TestingModule } from '@nestjs/testing';

import { HashProvider } from '../../../shared/providers/HashProvider/implementations/HashProvider';
import { UsersRepositoryInMemory } from '../repositories/in-memory/UsersRepositoryInMemory';
import { UsersRepository } from './../repositories/implementations/UsersRepository';
import { UsersService } from './../services/users.service';
import { UsersController } from './users.controller';

describe('ConController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        HashProvider,
        {
          provide: UsersRepository,
          useClass: UsersRepositoryInMemory,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    controller = module.get<UsersController>(UsersController);
    // service = await module.resolve(UsersService); // to use request
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Create user route', () => {
    it('should be able to create user and return it without password', async () => {
      const user = await controller.create(newFakeUser());

      expect(user).toHaveProperty('id');
      expect(user.id).toBeDefined();
      expect(user.password).toBeUndefined();
    });
  });

  describe('Get me route', () => {
    it('should be able to get users information by token', async () => {
      const user = await usersService.create(newFakeUser());
      const me = await controller.findMe({ userId: user.id } as UserPayloadDto);

      expect(me).toHaveProperty('id');
      expect(me.id).toBeDefined();
      expect(me.password).toBeUndefined();
    });
  });

  describe('Find user by id route', () => {
    it('should be able to get user by id', async () => {
      const user = await usersService.create(newFakeUser());
      const userFound = await controller.findOne(user.id);

      expect(userFound).toHaveProperty('id');
      expect(userFound.id).toBeDefined();
      expect(userFound.password).toBeUndefined();
    });
  });

  describe('Update user by id route', () => {
    it('should be able to update user by id', async () => {
      const user = await usersService.create(newFakeUser());
      const userUpdated = await controller.update(user.id, {
        name: 'Rodrigo',
      });

      expect(userUpdated).toHaveProperty('id');
      expect(userUpdated).toHaveProperty('name', 'Rodrigo');
      expect(userUpdated.password).toBeUndefined();
    });
  });
});
