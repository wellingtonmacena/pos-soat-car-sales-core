import { Module } from '@nestjs/common';
import { PaymentOrderController } from './payment_order.controller';
import { PaymentOrderRepository } from './payment_order.repository';
import { PaymentOrderService } from './payment_order.service';

@Module({
  controllers: [PaymentOrderController],
  providers: [PaymentOrderService, PaymentOrderRepository],
  exports: [PaymentOrderService, PaymentOrderRepository],
})
export class PaymentOrderModule {}
