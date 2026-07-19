import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class WebhookPaymentOrderDto {
  @ApiProperty({
    default: 'completed',
    example: 'completed',
    description: 'Final payment status reported by the payment gateway',
    enum: ['completed', 'cancelled'],
  })
  @IsIn(['completed', 'cancelled'])
  status: 'completed' | 'cancelled';
}
