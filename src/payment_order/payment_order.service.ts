import { randomUUID } from 'crypto';
import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import axios from 'axios';
import { CreatePaymentOrderDto } from './dto/create-payment_order.dto';
import { UpdatePaymentOrderDto } from './dto/update-payment_order.dto';
import { PaymentOrderStatus } from './entities/payment_order.entity';
import { PaymentOrderRepository } from './payment_order.repository';

@Injectable()
export class PaymentOrderService {
  constructor(
    private readonly paymentOrderRepository: PaymentOrderRepository,
  ) {}

  create(createPaymentOrderDto: CreatePaymentOrderDto) {
    return this.paymentOrderRepository.create({
      saleId: createPaymentOrderDto.saleId,
      paymentCode: randomUUID(),
      status: createPaymentOrderDto.status ?? PaymentOrderStatus.PENDING,
    });
  }

  findAll() {
    return this.paymentOrderRepository.findAll();
  }

  async findOne(id: number) {
    const paymentOrder = await this.paymentOrderRepository.findOne(id);

    if (!paymentOrder) {
      throw new NotFoundException(`Payment order #${id} not found`);
    }

    return paymentOrder;
  }

  async findByCode(paymentCode: string) {
    const paymentOrder = await this.paymentOrderRepository.findByCode(paymentCode);

    if (!paymentOrder) {
      throw new NotFoundException(`Payment order with code ${paymentCode} not found`);
    }

    return paymentOrder;
  }

  async update(id: number, updatePaymentOrderDto: UpdatePaymentOrderDto) {
    const paymentOrder = await this.paymentOrderRepository.update(
      id,
      updatePaymentOrderDto,
    );

    if (!paymentOrder) {
      throw new NotFoundException(`Payment order #${id} not found`);
    }

    return paymentOrder;
  }

  remove(id: number) {
    return this.paymentOrderRepository.remove(id);
  }

  async processWebhook(paymentCode: string, status: 'completed' | 'cancelled') {
    const paymentOrder =
      await this.paymentOrderRepository.findByCode(paymentCode);

    if (!paymentOrder) {
      throw new NotFoundException(
        `Payment order with code ${paymentCode} not found`,
      );
    }

    const updatedPaymentOrder = await this.paymentOrderRepository.updateStatus(
      paymentOrder.id,
      status,
    );

    const carSalesServiceUrl = process.env.CAR_SALES_SERVICE_URL;

    if (!carSalesServiceUrl) {
      throw new ServiceUnavailableException(
        'CAR_SALES_SERVICE_URL is not configured',
      );
    }

    try {
      await axios.patch(
        `${carSalesServiceUrl}/sales/${paymentOrder.saleId}/payment-status`,
        { status },
      );
    } catch {
      throw new ServiceUnavailableException(
        'Unable to notify car sales service',
      );
    }

    return updatedPaymentOrder;
  }
}
