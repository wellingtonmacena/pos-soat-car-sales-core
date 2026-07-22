import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreatePaymentOrderDto } from './dto/create-payment_order.dto';
import { UpdatePaymentOrderDto } from './dto/update-payment_order.dto';
import { WebhookPaymentOrderDto } from './dto/webhook-payment_order.dto';
import { PaymentOrderService } from './payment_order.service';

@ApiTags('payment-order')
@Controller('payment-order')
export class PaymentOrderController {
  constructor(private readonly paymentOrderService: PaymentOrderService) {}

  @Post()
  @ApiBody({ type: CreatePaymentOrderDto })
  create(@Body() createPaymentOrderDto: CreatePaymentOrderDto) {
    return this.paymentOrderService.create(createPaymentOrderDto);
  }

  @Get()
  findAll(@Query('id') id?: string, @Query('paymentCode') paymentCode?: string) {
    if (id) {
      return this.paymentOrderService.findOne(+id);
    }
    if (paymentCode) {
      return this.paymentOrderService.findByCode(paymentCode);
    }
    return this.paymentOrderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentOrderService.findOne(+id);
  }

  @Patch(':id')
  @ApiBody({ type: UpdatePaymentOrderDto })
  update(
    @Param('id') id: string,
    @Body() updatePaymentOrderDto: UpdatePaymentOrderDto,
  ) {
    return this.paymentOrderService.update(+id, updatePaymentOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentOrderService.remove(+id);
  }

  @Patch('webhook/:paymentCode')
  @ApiOperation({
    summary: 'Payment gateway webhook',
    description:
      'Updates the payment order status and notifies the car sales service so the sale can be finalized or released.',
  })
  @ApiBody({ type: WebhookPaymentOrderDto })
  processWebhook(
    @Param('paymentCode') paymentCode: string,
    @Body() webhookPaymentOrderDto: WebhookPaymentOrderDto,
  ) {
    return this.paymentOrderService.processWebhook(
      paymentCode,
      webhookPaymentOrderDto.status,
    );
  }
}
