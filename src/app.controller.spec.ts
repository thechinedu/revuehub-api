import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
  });

  describe('getHome', () => {
    it('should return "Welcome to the RevueHub API"', () => {
      const appController = app.get<AppController>(AppController);
      expect(appController.getHome()).toStrictEqual({
        data: { message: 'Welcome to the RevueHub API' },
        status: 'success',
      });
    });
  });
});
