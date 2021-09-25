//yarn test:watch -- test.service

import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    // service = await module.resolve(UsersService); // to use request
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
