import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AppDataSource } from '../db/data-source';
import { CreatePaymentOrderDto } from './dto/create-payment_order.dto';
import { UpdatePaymentOrderDto } from './dto/update-payment_order.dto';
import { PaymentOrder } from './entities/payment_order.entity';

export interface CreatePaymentOrderData extends Omit<
  CreatePaymentOrderDto,
  'status'
> {
  paymentCode: string;
  status: string;
}

@Injectable()
export class PaymentOrderRepository {
  private async repository(): Promise<Repository<PaymentOrder>> {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    return AppDataSource.getRepository(PaymentOrder);
  }

  async create(createPaymentOrderData: CreatePaymentOrderData) {
    const repository = await this.repository();
    const paymentOrder = repository.create({
      saleId: createPaymentOrderData.saleId,
      paymentCode: createPaymentOrderData.paymentCode,
      status: createPaymentOrderData.status,
    });

    return repository.save(paymentOrder);
  }

  async findAll() {
    const repository = await this.repository();

    return repository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const repository = await this.repository();

    return repository.findOneBy({ id });
  }

  async findByCode(paymentCode: string) {
    const repository = await this.repository();

    return repository.findOneBy({ paymentCode });
  }

  async update(id: number, updatePaymentOrderDto: UpdatePaymentOrderDto) {
    const repository = await this.repository();

    await repository.update(id, updatePaymentOrderDto);

    return this.findOne(id);
  }

  async updateStatus(id: number, status: string) {
    const repository = await this.repository();

    await repository.update(id, { status });

    return this.findOne(id);
  }

  async remove(id: number) {
    const repository = await this.repository();

    return repository.delete(id);
  }
}
