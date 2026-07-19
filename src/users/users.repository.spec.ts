import { AppDataSource } from '../db/data-source';
import { UsersRepository } from './users.repository';

jest.mock('../db/data-source', () => ({
  AppDataSource: {
    isInitialized: true,
    initialize: jest.fn(),
    getRepository: jest.fn(),
  },
}));

describe('UsersRepository', () => {
  let repository: UsersRepository;
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

    repository = new UsersRepository();
  });

  it('initializes the data source when not yet initialized', async () => {
    (AppDataSource as unknown as { isInitialized: boolean }).isInitialized =
      false;
    (AppDataSource.initialize as jest.Mock).mockResolvedValue(undefined);

    await repository.findAll();

    expect(AppDataSource.initialize).toHaveBeenCalledTimes(1);
  });

  it('creates a user', async () => {
    const dto = {
      cpf: '12345678901',
      cnpj: undefined,
      nome: 'Maria Silva',
      email: 'maria.silva@example.com',
      dataNascimento: '1995-08-15',
    };

    const result = await repository.create(dto);

    expect(mockOrmRepository.create).toHaveBeenCalledWith(dto);
    expect(mockOrmRepository.save).toHaveBeenCalled();
    expect(result).toEqual(expect.objectContaining({ nome: 'Maria Silva' }));
  });

  it('finds all users ordered by id', async () => {
    mockOrmRepository.find.mockResolvedValue([{ id: 1 }]);

    const result = await repository.findAll();

    expect(mockOrmRepository.find).toHaveBeenCalledWith({
      order: { id: 'ASC' },
    });
    expect(result).toEqual([{ id: 1 }]);
  });

  it('finds one user by id', async () => {
    mockOrmRepository.findOneBy.mockResolvedValue({ id: 1 });

    const result = await repository.findOne(1);

    expect(mockOrmRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(result).toEqual({ id: 1 });
  });

  it('returns null when the user is not found', async () => {
    mockOrmRepository.findOneBy.mockResolvedValue(null);

    const result = await repository.findOne(999);

    expect(result).toBeNull();
  });

  it('updates a user', async () => {
    mockOrmRepository.findOneBy.mockResolvedValue({
      id: 1,
      nome: 'Novo Nome',
    });

    const result = await repository.update(1, { nome: 'Novo Nome' });

    expect(mockOrmRepository.update).toHaveBeenCalledWith(1, {
      nome: 'Novo Nome',
    });
    expect(result).toEqual({ id: 1, nome: 'Novo Nome' });
  });

  it('removes a user', async () => {
    mockOrmRepository.delete.mockResolvedValue({ affected: 1 });

    const result = await repository.remove(1);

    expect(mockOrmRepository.delete).toHaveBeenCalledWith(1);
    expect(result).toEqual({ affected: 1 });
  });
});
