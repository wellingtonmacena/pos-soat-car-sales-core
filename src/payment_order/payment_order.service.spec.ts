import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import axios from 'axios';
import { PaymentOrderRepository } from './payment_order.repository';
import { PaymentOrderService } from './payment_order.service';

jest.mock('axios');
jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomUUID: jest.fn(() => 'generated-payment-code'),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PaymentOrderService', () => {
  let service: PaymentOrderService;
  let repository: jest.Mocked<PaymentOrderRepository>;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };

    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByCode: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<PaymentOrderRepository>;

    service = new PaymentOrderService(repository);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('create', () => {
    it('generates a payment code and defaults status to pending', async () => {
      repository.create.mockResolvedValue({
        id: 1,
        saleId: 1001,
        paymentCode: 'generated-payment-code',
        status: 'pending',
      } as any);

      const result = await service.create({ saleId: 1001 });

      expect(repository.create).toHaveBeenCalledWith({
        saleId: 1001,
        paymentCode: 'generated-payment-code',
        status: 'pending',
      });
      expect(result.status).toBe('pending');
    });

    it('uses the status provided in the dto when present', async () => {
      repository.create.mockResolvedValue({} as any);

      await service.create({ saleId: 1001, status: 'completed' });

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'completed' }),
      );
    });
  });

  it('finds all payment orders', async () => {
    repository.findAll.mockResolvedValue([{ id: 1 } as any]);

    const result = await service.findAll();

    expect(result).toEqual([{ id: 1 }]);
  });

  describe('findOne', () => {
    it('returns the payment order when found', async () => {
      repository.findOne.mockResolvedValue({ id: 1 } as any);

      const result = await service.findOne(1);

      expect(result).toEqual({ id: 1 });
    });

    it('throws NotFoundException when not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('returns the updated payment order when found', async () => {
      repository.update.mockResolvedValue({
        id: 1,
        status: 'completed',
      } as any);

      const result = await service.update(1, { status: 'completed' });

      expect(result).toEqual({ id: 1, status: 'completed' });
    });

    it('throws NotFoundException when not found', async () => {
      repository.update.mockResolvedValue(null);

      await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
    });
  });

  it('removes a payment order', async () => {
    repository.remove.mockResolvedValue({ affected: 1 } as any);

    const result = await service.remove(1);

    expect(result).toEqual({ affected: 1 });
  });

  describe('processWebhook', () => {
    it('throws NotFoundException when the payment order does not exist', async () => {
      repository.findByCode.mockResolvedValue(null);

      await expect(
        service.processWebhook('unknown-code', 'completed'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ServiceUnavailableException when CAR_SALES_SERVICE_URL is not configured', async () => {
      delete process.env.CAR_SALES_SERVICE_URL;
      repository.findByCode.mockResolvedValue({
        id: 1,
        saleId: 1001,
        paymentCode: 'code-123',
        status: 'pending',
      } as any);
      repository.updateStatus.mockResolvedValue({
        id: 1,
        saleId: 1001,
        paymentCode: 'code-123',
        status: 'completed',
      } as any);

      await expect(
        service.processWebhook('code-123', 'completed'),
      ).rejects.toThrow(ServiceUnavailableException);
    });

    it('throws ServiceUnavailableException when the car sales service call fails', async () => {
      process.env.CAR_SALES_SERVICE_URL = 'http://car-sales:3001';
      repository.findByCode.mockResolvedValue({
        id: 1,
        saleId: 1001,
        paymentCode: 'code-123',
        status: 'pending',
      } as any);
      repository.updateStatus.mockResolvedValue({
        id: 1,
        saleId: 1001,
        paymentCode: 'code-123',
        status: 'completed',
      } as any);
      mockedAxios.patch.mockRejectedValue(new Error('network error'));

      await expect(
        service.processWebhook('code-123', 'completed'),
      ).rejects.toThrow(ServiceUnavailableException);
    });

    it('updates the status and notifies the car sales service on success', async () => {
      process.env.CAR_SALES_SERVICE_URL = 'http://car-sales:3001';
      repository.findByCode.mockResolvedValue({
        id: 1,
        saleId: 1001,
        paymentCode: 'code-123',
        status: 'pending',
      } as any);
      const updated = {
        id: 1,
        saleId: 1001,
        paymentCode: 'code-123',
        status: 'completed',
      };
      repository.updateStatus.mockResolvedValue(updated as any);
      mockedAxios.patch.mockResolvedValue({ data: {} });

      const result = await service.processWebhook('code-123', 'completed');

      expect(repository.updateStatus).toHaveBeenCalledWith(1, 'completed');
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        'http://car-sales:3001/sales/1001/payment-status',
        { status: 'completed' },
      );
      expect(result).toEqual(updated);
    });
  });
});
