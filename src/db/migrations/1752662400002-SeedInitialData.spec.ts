import { QueryRunner } from 'typeorm';
import { SeedInitialData1752662400002 } from './1752662400002-SeedInitialData';

describe('SeedInitialData1752662400002', () => {
  let migration: SeedInitialData1752662400002;
  let queryRunner: Partial<QueryRunner>;

  beforeEach(() => {
    migration = new SeedInitialData1752662400002();
    queryRunner = {
      query: jest.fn().mockResolvedValue(undefined),
    };
  });

  it('seeds users and payment orders', async () => {
    await migration.up(queryRunner as QueryRunner);

    expect(queryRunner.query).toHaveBeenCalledTimes(2);
    expect(queryRunner.query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('INSERT INTO users'),
    );
    expect(queryRunner.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('INSERT INTO payment_order'),
    );
  });

  it('removes the seeded rows', async () => {
    await migration.down(queryRunner as QueryRunner);

    expect(queryRunner.query).toHaveBeenCalledTimes(2);
    expect(queryRunner.query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('DELETE FROM payment_order'),
    );
    expect(queryRunner.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('DELETE FROM users'),
    );
  });
});
