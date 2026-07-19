import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PaymentOrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export const PAYMENT_ORDER_STATUS_VALUES = Object.values(PaymentOrderStatus);

@Entity('payment_order')
export class PaymentOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sale_id', type: 'int' })
  saleId: number;

  @Column({ name: 'payment_code', type: 'varchar', length: 36, unique: true })
  paymentCode: string;

  @Column({ type: 'varchar', length: 30 })
  status: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
