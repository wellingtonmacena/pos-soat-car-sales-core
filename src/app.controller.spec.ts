import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: {
    getHello: jest.Mock;
    resetToLatestMigrations: jest.Mock;
  };

  beforeEach(async () => {
    appService = {
      getHello: jest.fn(),
      resetToLatestMigrations: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: appService }],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      appService.getHello.mockReturnValue('Hello World!');
      expect(appController.getHello()).toBe('Hello World!');
      expect(appService.getHello).toHaveBeenCalledTimes(1);
    });

    it('delegates reset-to-migrations to service', async () => {
      const result = {
        status: 'ok',
        message: 'Database reset to latest migrations',
        migrationsExecuted: 3,
      };

      appService.resetToLatestMigrations.mockResolvedValue(result);

      await expect(appController.resetToMigrations()).resolves.toEqual(result);
      expect(appService.resetToLatestMigrations).toHaveBeenCalledTimes(1);
    });
  });
});
