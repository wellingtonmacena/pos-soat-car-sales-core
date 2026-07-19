import { CreatePaymentOrderDto } from './create-payment_order.dto';

describe('CreatePaymentOrderDto', () => {
  it('exposes the default sample values', () => {
    const dto = new CreatePaymentOrderDto();

    expect(dto.saleId).toBe(1001);
    expect(dto.status).toBe('pending');
  });
});
