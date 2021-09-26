import { UserEntity } from './../entities/user.entity';
import { Test, TestingModule } from '@nestjs/testing';
import faker from 'faker';

// import { PrismaService } from '../../../prisma/prisma.service';
import { HashProvider } from '../../../shared/providers/HashProvider/implementations/HashProvider';
import { UsersRepository } from './../repositories/implementations/UsersRepository';
import { UsersService } from './users.service';
import { UsersRepositoryInMemory } from '../repositories/in-memory/UsersRepositoryInMemory';
import { BadRequestException, NotFoundException } from '@nestjs/common';

// import { User } from '.prisma/client';
//yarn test:watch -- test.service

// import { PrismaClient } from '@prisma/client';

// type RecursivePartial<T> = {
//   [P in keyof T]?: RecursivePartial<T[P]>;
// };

// const usersArray: User[] = [
//   {
//     id: 1,
//     email: 'test1@example.com',
//     password: '$123',
//     roles: [],
//     permissions: [],
//     name: 'john Doe 1',
//     avatar: null,
//     created_at: new Date(),
//     updatedAt: new Date(),
//   },
//   {
//     id: 2,
//     email: 'test2@example.com',
//     password: '$123',
//     roles: [],
//     permissions: [],
//     name: 'john Doe 2',
//     avatar: null,
//     created_at: new Date(),
//     updatedAt: new Date(),
//   },
// ];

// const oneUser = usersArray[0];

// const db: RecursivePartial<PrismaClient> = {
//   user: {
//     findMany: jest.fn().mockResolvedValue(usersArray),
//     findUnique: jest.fn((email) => usersArray.find((i) => i === email)),
//     findFirst: jest.fn().mockResolvedValue(oneUser),
//     create: jest.fn().mockReturnValue(newUser),
//     update: jest.fn().mockResolvedValue(oneUser),
//     delete: jest.fn().mockResolvedValue(oneUser),
//   },
// };

const newUser = () => {
  return {
    email: faker.internet.email(),
    password: '123456',
    roles: [],
    permissions: [],
    name: faker.name.findName(),
  };
};

describe('UsersService', () => {
  let service: UsersService;
  // let usersRepository: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        HashProvider,
        {
          provide: UsersRepository,
          useClass: UsersRepositoryInMemory,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    // service = await module.resolve(UsersService); // to use request
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create user', () => {
    it('should create and return the created user', async () => {
      const user = await service.create(newUser());
      expect(user).toBeInstanceOf(UserEntity);
    });
    it('should not be able to create a user with same email', async () => {
      const user = newUser();

      await service.create(user);

      try {
        await service.create(user);
      } catch (err) {
        expect(err).toEqual(new BadRequestException('User already exists'));
      }
    });
  });

  describe('Update user', () => {
    it('should update and return the updated user', async () => {
      const user = await service.create(newUser());
      const userUpdated = await service.update(user.id, { name: 'Rodrigo' });
      const userUpdated2 = await service.update(user.id, {
        name: 'Rodrigo2',
        password: '1234567',
        oldPassword: '123456',
      });
      expect(userUpdated).toHaveProperty('name', 'Rodrigo');
      expect(userUpdated2).toHaveProperty('name', 'Rodrigo2');
    });
    it('should not be able to update a user that does not exist', async () => {
      try {
        await service.update(123, {
          name: 'Rodrigo',
        });
      } catch (err) {
        console.log(`err`, err);
        expect(err).toEqual(new NotFoundException(`user #123 not found`));
      }
    });
    it('should not be able to update user with oldPassword field missing if password field is present', async () => {
      const user = await service.create(newUser());
      try {
        await service.update(user.id, {
          password: '123',
        });
      } catch (err) {
        expect(err).toEqual(new BadRequestException(`Old password missing`));
      }
    });
    it('should not be able to update user if oldPassword is different from actual password', async () => {
      const user = await service.create(newUser());
      try {
        await service.update(user.id, {
          password: '1234567',
          oldPassword: '1234560', //actual password is 123456
        });
      } catch (err) {
        expect(err).toEqual(new BadRequestException(`password incorrect`));
      }
    });
  });

  describe('remove user', () => {
    it('should remove and return the removed user by id', async () => {
      const user = await service.create(newUser());
      const userRemoved = await service.remove(user.id);
      expect(userRemoved).toHaveProperty('id');
    });
    it('should not be able to remove user that does not exists', async () => {
      try {
        await service.remove(123);
      } catch (err) {
        expect(err).toEqual(new NotFoundException(`user #123 not found`));
      }
    });
  });

  describe('Find user by e-mail', () => {
    it('should find user by email and return', async () => {
      const new_user = await service.create(newUser());
      const user = await service.findByEmail(new_user.email);
      expect(user).toHaveProperty('id', new_user.id);
    });
    it('should not be able to find user that does not exists', async () => {
      try {
        await service.findByEmail('fake@email.com');
      } catch (err) {
        expect(err).toEqual(new NotFoundException('User not found'));
      }
    });
  });
  describe('Find user by id', () => {
    it('should find user by id and return', async () => {
      const new_user = await service.create(newUser());
      const user = await service.findById(new_user.id);
      expect(user).toHaveProperty('id', new_user.id);
      expect(user).toHaveProperty('email', new_user.email);
    });
    it('should not be able to find user that does not exists', async () => {
      try {
        await service.findById(123);
      } catch (err) {
        expect(err).toEqual(new NotFoundException('User not found'));
      }
    });
  });
});
