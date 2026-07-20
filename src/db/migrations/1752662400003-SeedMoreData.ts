import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedMoreData1752662400003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO users (id, cpf, cnpj, nome, email, data_nascimento, created_at, updated_at)
      VALUES
        (3, '390.533.447-05', NULL, 'Joao Pereira', 'joao.pereira@example.com', '1988-03-12', NOW(), NOW()),
        (4, '239.827.498-59', NULL, 'Ana Costa', 'ana.costa@example.com', '1992-11-25', NOW(), NOW()),
        (5, NULL, '45.987.120/0001-77', 'Auto Prime Veiculos LTDA', 'financeiro@autoprime.com.br', NULL, NOW(), NOW()),
        (6, NULL, '62.345.980/0001-10', 'Brasil Motors Comercio SA', 'vendas@brasilmotors.com.br', NULL, NOW(), NOW())
    `);

    await queryRunner.query(`
      INSERT INTO payment_order (id, sale_id, payment_code, status, created_at, updated_at)
      VALUES
        (3, 9003, '33333333-3333-4333-8333-333333333333', 'pending', NOW(), NOW()),
        (4, 9004, '44444444-4444-4444-8444-444444444444', 'completed', NOW(), NOW()),
        (5, 9005, '55555555-5555-4555-8555-555555555555', 'cancelled', NOW(), NOW()),
        (6, 9006, '66666666-6666-4666-8666-666666666666', 'pending', NOW(), NOW())
    `);

    await queryRunner.query(`
      SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT COALESCE(MAX(id), 1) FROM users))
    `);

    await queryRunner.query(`
      SELECT setval(pg_get_serial_sequence('payment_order', 'id'), (SELECT COALESCE(MAX(id), 1) FROM payment_order))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM payment_order WHERE id IN (3, 4, 5, 6)`);
    await queryRunner.query(`DELETE FROM users WHERE id IN (3, 4, 5, 6)`);
  }
}
