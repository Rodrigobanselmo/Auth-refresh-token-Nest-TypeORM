//yarn test:watch -- test.service

import { Test, TestingModule } from '@nestjs/testing';
import { TestService } from './test.service';

describe('TestService', () => {
  let service: TestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TestService],
    }).compile();

    service = module.get<TestService>(TestService);
    // service = await module.resolve(TestService); // to use request
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
