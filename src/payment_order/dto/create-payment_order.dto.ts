import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional } from 'class-validator';
import { PAYMENT_ORDER_STATUS_VALUES } from '../entities/payment_order.entity';

export class CreatePaymentOrderDto {
  @ApiProperty({
    default: 1001,
    example: 1001,
    description: 'Identifier of the sale associated with the payment order',
  })
  @IsInt()
  saleId: number = 1001;

  @ApiPropertyOptional({
    default: 'pending',
    example: 'pending',
    description:
      'Current payment order status. Defaults to "pending" when omitted.',
    enum: PAYMENT_ORDER_STATUS_VALUES,
  })
  @IsOptional()
  @IsIn(PAYMENT_ORDER_STATUS_VALUES)
  status?: string = 'pending';
}
