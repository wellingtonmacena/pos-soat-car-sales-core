import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedInitialData1752662400002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO users (cpf, cnpj, nome, email, data_nascimento, created_at, updated_at)
      VALUES
        ('77873619052', NULL, 'Maria Silva', 'maria.silva@example.com', '1995-08-15', NOW(), NOW()),
        (NULL, '12345678000199', 'Loja Central LTDA', 'contato@lojacentral.com.br', NULL, NOW(), NOW())
    `);

    await queryRunner.query(`
      INSERT INTO payment_order (sale_id, payment_code, status, created_at, updated_at)
      VALUES
        (9001, '11111111-1111-4111-8111-111111111111', 'pending', NOW(), NOW()),
        (9002, '22222222-2222-4222-8222-222222222222', 'completed', NOW(), NOW())
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM payment_order
      WHERE sale_id IN (9001, 9002)
    `);

    await queryRunner.query(`
      DELETE FROM users
      WHERE email IN ('maria.silva@example.com', 'contato@lojacentral.com.br')
    `);
  }
}
