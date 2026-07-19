import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentOrderDto } from './create-payment_order.dto';

export class UpdatePaymentOrderDto extends PartialType(CreatePaymentOrderDto) {}
