import { PrismaService } from '../../../prisma/prisma.service';
import { UsersRepository } from './../repositories/implementations/UsersRepository';
import { User } from '.prisma/client';
import { HashProvider } from '../../../shared/providers/HashProvider/implementations/HashProvider';
//yarn test:watch -- test.service

import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

const usersArray: User[] = [
  {
    id: 1,
    email: 'test1@example.com',
    password: '$123',
    roles: [],
    permissions: [],
    name: 'john Doe 1',
    avatar: null,
    created_at: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    email: 'test2@example.com',
    password: '$123',
    roles: [],
    permissions: [],
    name: 'john Doe 2',
    avatar: null,
    created_at: new Date(),
    updatedAt: new Date(),
  },
];

const oneUser = usersArray[0];

const db = {
  user: {
    findMany: jest.fn().mockResolvedValue(usersArray),
    findUnique: jest.fn().mockResolvedValue(oneUser),
    findFirst: jest.fn().mockResolvedValue(oneUser),
    create: jest.fn().mockReturnValue(oneUser),
    save: jest.fn(),
    update: jest.fn().mockResolvedValue(oneUser),
    delete: jest.fn().mockResolvedValue(oneUser),
  },
};

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        UsersRepository,
        HashProvider,
        {
          provide: PrismaService,
          useValue: db,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<UsersRepository>(UsersRepository);
    // service = await module.resolve(UsersService); // to use request
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
