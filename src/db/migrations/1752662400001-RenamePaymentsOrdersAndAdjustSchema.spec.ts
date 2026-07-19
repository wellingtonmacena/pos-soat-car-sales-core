import { QueryRunner, Table } from 'typeorm';
import { RenamePaymentsOrdersAndAdjustSchema1752662400001 } from './1752662400001-RenamePaymentsOrdersAndAdjustSchema';

describe('RenamePaymentsOrdersAndAdjustSchema1752662400001', () => {
  let migration: RenamePaymentsOrdersAndAdjustSchema1752662400001;
  let queryRunner: Partial<QueryRunner>;

  beforeEach(() => {
    migration = new RenamePaymentsOrdersAndAdjustSchema1752662400001();
    queryRunner = {
      getTable: jest.fn(),
      renameTable: jest.fn().mockResolvedValue(undefined),
      changeColumn: jest.fn().mockResolvedValue(undefined),
      addColumn: jest.fn().mockResolvedValue(undefined),
      dropColumn: jest.fn().mockResolvedValue(undefined),
    };
  });

  describe('up', () => {
    it('renames the table and adjusts columns when everything is pending', async () => {
      (queryRunner.getTable as jest.Mock).mockImplementation((name: string) =>
        name === 'payments_orders'
          ? ({} as Table)
          : {
              findColumnByName: (column: string) =>
                column === 'status' || column === 'sale_id',
            },
      );

      await migration.up(queryRunner as QueryRunner);

      expect(queryRunner.renameTable).toHaveBeenCalledWith(
        'payments_orders',
        'payment_order',
      );
      expect(queryRunner.changeColumn).toHaveBeenCalledTimes(2);
      expect(queryRunner.addColumn).toHaveBeenCalledTimes(1);
    });

    it('does nothing when the source table does not exist', async () => {
      (queryRunner.getTable as jest.Mock).mockResolvedValue(undefined);

      await migration.up(queryRunner as QueryRunner);

      expect(queryRunner.renameTable).not.toHaveBeenCalled();
      expect(queryRunner.changeColumn).not.toHaveBeenCalled();
      expect(queryRunner.addColumn).not.toHaveBeenCalled();
    });

    it('skips adding payment_code when it already exists', async () => {
      (queryRunner.getTable as jest.Mock).mockImplementation((name: string) =>
        name === 'payments_orders'
          ? undefined
          : {
              findColumnByName: () => true,
            },
      );

      await migration.up(queryRunner as QueryRunner);

      expect(queryRunner.addColumn).not.toHaveBeenCalled();
      expect(queryRunner.changeColumn).toHaveBeenCalledTimes(2);
    });
  });

  describe('down', () => {
    it('reverts the column adjustments and renames the table back', async () => {
      (queryRunner.getTable as jest.Mock).mockResolvedValue({
        findColumnByName: () => true,
      });

      await migration.down(queryRunner as QueryRunner);

      expect(queryRunner.dropColumn).toHaveBeenCalledWith(
        'payment_order',
        'payment_code',
      );
      expect(queryRunner.changeColumn).toHaveBeenCalledTimes(2);
      expect(queryRunner.renameTable).toHaveBeenCalledWith(
        'payment_order',
        'payments_orders',
      );
    });

    it('does nothing when the table does not exist', async () => {
      (queryRunner.getTable as jest.Mock).mockResolvedValue(undefined);

      await migration.down(queryRunner as QueryRunner);

      expect(queryRunner.dropColumn).not.toHaveBeenCalled();
      expect(queryRunner.changeColumn).not.toHaveBeenCalled();
      expect(queryRunner.renameTable).not.toHaveBeenCalled();
    });
  });
});
