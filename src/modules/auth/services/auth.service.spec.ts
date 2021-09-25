//yarn test:watch -- test.service

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    // service = await module.resolve(AuthService); // to use request
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
