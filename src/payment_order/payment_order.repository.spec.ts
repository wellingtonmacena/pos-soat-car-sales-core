import { AppDataSource } from '../db/data-source';
import { PaymentOrderRepository } from './payment_order.repository';

jest.mock('../db/data-source', () => ({
  AppDataSource: {
    isInitialized: true,
    initialize: jest.fn(),
    getRepository: jest.fn(),
  },
}));

describe('PaymentOrderRepository', () => {
  let repository: PaymentOrderRepository;
  let mockOrmRepository: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOneBy: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (AppDataSource as unknown as { isInitialized: boolean }).isInitialized =
      true;

    mockOrmRepository = {
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve({ id: 1, ...data })),
      find: jest.fn(),
      findOneBy: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(
      mockOrmRepository,
    );

    repository = new PaymentOrderRepository();
  });

  it('initializes the data source when not yet initialized', async () => {
    (AppDataSource as unknown as { isInitialized: boolean }).isInitialized =
      false;
    (AppDataSource.initialize as jest.Mock).mockResolvedValue(undefined);

    await repository.findAll();

    expect(AppDataSource.initialize).toHaveBeenCalledTimes(1);
  });

  it('creates a payment order', async () => {
    const result = await repository.create({
      saleId: 1001,
      paymentCode: 'code-123',
      status: 'pending',
    });

    expect(mockOrmRepository.create).toHaveBeenCalledWith({
      saleId: 1001,
      paymentCode: 'code-123',
      status: 'pending',
    });
    expect(mockOrmRepository.save).toHaveBeenCalled();
    expect(result).toEqual(
      expect.objectContaining({ saleId: 1001, paymentCode: 'code-123' }),
    );
  });

  it('finds all payment orders ordered by id', async () => {
    mockOrmRepository.find.mockResolvedValue([{ id: 1 }]);

    const result = await repository.findAll();

    expect(mockOrmRepository.find).toHaveBeenCalledWith({
      order: { id: 'ASC' },
    });
    expect(result).toEqual([{ id: 1 }]);
  });

  it('finds one payment order by id', async () => {
    mockOrmRepository.findOneBy.mockResolvedValue({ id: 1 });

    const result = await repository.findOne(1);

    expect(mockOrmRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(result).toEqual({ id: 1 });
  });

  it('returns null when the payment order is not found by id', async () => {
    mockOrmRepository.findOneBy.mockResolvedValue(null);

    const result = await repository.findOne(999);

    expect(result).toBeNull();
  });

  it('finds one payment order by payment code', async () => {
    mockOrmRepository.findOneBy.mockResolvedValue({
      id: 1,
      paymentCode: 'code-123',
    });

    const result = await repository.findByCode('code-123');

    expect(mockOrmRepository.findOneBy).toHaveBeenCalledWith({
      paymentCode: 'code-123',
    });
    expect(result).toEqual({ id: 1, paymentCode: 'code-123' });
  });

  it('updates a payment order', async () => {
    mockOrmRepository.findOneBy.mockResolvedValue({ id: 1, status: 'pending' });

    const result = await repository.update(1, { status: 'pending' });

    expect(mockOrmRepository.update).toHaveBeenCalledWith(1, {
      status: 'pending',
    });
    expect(result).toEqual({ id: 1, status: 'pending' });
  });

  it('updates only the status of a payment order', async () => {
    mockOrmRepository.findOneBy.mockResolvedValue({
      id: 1,
      status: 'completed',
    });

    const result = await repository.updateStatus(1, 'completed');

    expect(mockOrmRepository.update).toHaveBeenCalledWith(1, {
      status: 'completed',
    });
    expect(result).toEqual({ id: 1, status: 'completed' });
  });

  it('removes a payment order', async () => {
    mockOrmRepository.delete.mockResolvedValue({ affected: 1 });

    const result = await repository.remove(1);

    expect(mockOrmRepository.delete).toHaveBeenCalledWith(1);
    expect(result).toEqual({ affected: 1 });
  });
});
