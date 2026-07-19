import { QueryRunner } from 'typeorm';
import { CreateUsersAndPaymentsOrders1752662400000 } from './1752662400000-CreateUsersAndPaymentsOrders';

describe('CreateUsersAndPaymentsOrders1752662400000', () => {
  let migration: CreateUsersAndPaymentsOrders1752662400000;
  let queryRunner: Partial<QueryRunner>;

  beforeEach(() => {
    migration = new CreateUsersAndPaymentsOrders1752662400000();
    queryRunner = {
      createTable: jest.fn().mockResolvedValue(undefined),
      dropTable: jest.fn().mockResolvedValue(undefined),
    };
  });

  it('creates the users and payments_orders tables', async () => {
    await migration.up(queryRunner as QueryRunner);

    expect(queryRunner.createTable).toHaveBeenCalledTimes(2);
  });

  it('drops the payments_orders and users tables in reverse order', async () => {
    await migration.down(queryRunner as QueryRunner);

    expect(queryRunner.dropTable).toHaveBeenNthCalledWith(1, 'payments_orders');
    expect(queryRunner.dropTable).toHaveBeenNthCalledWith(2, 'users');
  });
});
