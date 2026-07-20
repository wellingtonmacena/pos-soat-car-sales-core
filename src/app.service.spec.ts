import { AppService } from './app.service';
import { getAppDataSource } from './db/data-source';

jest.mock('./db/data-source', () => ({
  getAppDataSource: jest.fn(),
}));

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
    jest.clearAllMocks();
  });

  it('returns hello world', () => {
    expect(service.getHello()).toBe('Hello World!');
  });

  it('resets database and reapplies latest migrations', async () => {
    const dropDatabase = jest.fn().mockResolvedValue(undefined);
    const runMigrations = jest.fn().mockResolvedValue([{}, {}]);

    (getAppDataSource as jest.Mock).mockResolvedValue({
      dropDatabase,
      runMigrations,
    });

    await expect(service.resetToLatestMigrations()).resolves.toEqual({
      status: 'ok',
      message: 'Database reset to latest migrations',
      migrationsExecuted: 2,
    });

    expect(dropDatabase).toHaveBeenCalledTimes(1);
    expect(runMigrations).toHaveBeenCalledTimes(1);
  });
});
