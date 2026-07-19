import { Test, TestingModule } from '@nestjs/testing';
import { PaymentOrderController } from './payment_order.controller';
import { PaymentOrderService } from './payment_order.service';

describe('PaymentOrderController', () => {
  let controller: PaymentOrderController;
  let service: jest.Mocked<PaymentOrderService>;

  beforeEach(async () => {
    const serviceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      processWebhook: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentOrderController],
      providers: [{ provide: PaymentOrderService, useValue: serviceMock }],
    }).compile();

    controller = module.get<PaymentOrderController>(PaymentOrderController);
    service = module.get(PaymentOrderService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('creates a payment order', async () => {
    const dto = { saleId: 1001, status: 'pending' };
    service.create.mockResolvedValue({ id: 1, ...dto } as any);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: 1, ...dto });
  });

  it('finds all payment orders', async () => {
    service.findAll.mockResolvedValue([{ id: 1 } as any]);

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual([{ id: 1 }]);
  });

  it('finds one payment order', async () => {
    service.findOne.mockResolvedValue({ id: 1 } as any);

    const result = await controller.findOne('1');

    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(result).toEqual({ id: 1 });
  });

  it('updates a payment order', async () => {
    const dto = { status: 'completed' };
    service.update.mockResolvedValue({ id: 1, ...dto } as any);

    const result = await controller.update('1', dto);

    expect(service.update).toHaveBeenCalledWith(1, dto);
    expect(result).toEqual({ id: 1, ...dto });
  });

  it('removes a payment order', async () => {
    service.remove.mockResolvedValue({ affected: 1 } as any);

    const result = await controller.remove('1');

    expect(service.remove).toHaveBeenCalledWith(1);
    expect(result).toEqual({ affected: 1 });
  });

  it('processes the payment webhook', async () => {
    const dto = { status: 'completed' as const };
    service.processWebhook.mockResolvedValue({
      id: 1,
      status: 'completed',
    } as any);

    const result = await controller.processWebhook('code-123', dto);

    expect(service.processWebhook).toHaveBeenCalledWith(
      'code-123',
      'completed',
    );
    expect(result).toEqual({ id: 1, status: 'completed' });
  });
});
