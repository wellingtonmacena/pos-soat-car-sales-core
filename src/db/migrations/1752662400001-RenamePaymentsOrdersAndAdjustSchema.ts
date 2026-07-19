import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RenamePaymentsOrdersAndAdjustSchema1752662400001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const paymentOrderTable = await queryRunner.getTable('payments_orders');

    if (paymentOrderTable) {
      await queryRunner.renameTable('payments_orders', 'payment_order');
    }

    const tableName = 'payment_order';
    const table = await queryRunner.getTable(tableName);

    if (table && table.findColumnByName('status')) {
      await queryRunner.changeColumn(
        tableName,
        'status',
        new TableColumn({
          name: 'status',
          type: 'varchar',
          length: '50',
          isNullable: false,
        }),
      );
    }

    if (table && table.findColumnByName('sale_id')) {
      await queryRunner.changeColumn(
        tableName,
        'sale_id',
        new TableColumn({
          name: 'sale_id',
          type: 'int',
          isNullable: false,
        }),
      );
    }

    if (table && !table.findColumnByName('payment_code')) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'payment_code',
          type: 'varchar',
          length: '36',
          isUnique: true,
          isNullable: false,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('payment_order');

    if (table && table.findColumnByName('payment_code')) {
      await queryRunner.dropColumn('payment_order', 'payment_code');
    }

    if (table && table.findColumnByName('sale_id')) {
      await queryRunner.changeColumn(
        'payment_order',
        'sale_id',
        new TableColumn({
          name: 'sale_id',
          type: 'int',
          isNullable: true,
        }),
      );
    }

    if (table && table.findColumnByName('status')) {
      await queryRunner.changeColumn(
        'payment_order',
        'status',
        new TableColumn({
          name: 'status',
          type: 'varchar',
          length: '30',
          isNullable: false,
        }),
      );
    }

    if (table) {
      await queryRunner.renameTable('payment_order', 'payments_orders');
    }
  }
}
