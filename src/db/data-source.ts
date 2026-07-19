import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from '../users/entities/user.entity';
import { PaymentOrder } from '../payment_order/entities/payment_order.entity';

config(); // Carrega as variáveis do arquivo .env

export const AppDataSource = new DataSource({
  type: 'postgres', // ou 'mysql', 'mariadb', etc.
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME ?? 'pos_soat_car_sales',
  entities: [User, PaymentOrder],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false, // Nunca use true em produção! Use migrations.
});

export async function getAppDataSource() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  return AppDataSource;
}
