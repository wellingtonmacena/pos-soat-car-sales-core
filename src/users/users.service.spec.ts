import { NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<UsersRepository>;

    service = new UsersService(repository);
  });

  it('creates a user', async () => {
    const dto = { nome: 'Maria Silva', email: 'maria.silva@example.com' };
    repository.create.mockResolvedValue({ id: 1, ...dto } as any);

    const result = await service.create(dto);

    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: 1, ...dto });
  });

  it('finds all users', async () => {
    repository.findAll.mockResolvedValue([{ id: 1 } as any]);

    const result = await service.findAll();

    expect(result).toEqual([{ id: 1 }]);
  });

  describe('findOne', () => {
    it('returns the user when found', async () => {
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
    it('returns the updated user when found', async () => {
      repository.update.mockResolvedValue({ id: 1, nome: 'Novo Nome' } as any);

      const result = await service.update(1, { nome: 'Novo Nome' });

      expect(result).toEqual({ id: 1, nome: 'Novo Nome' });
    });

    it('throws NotFoundException when not found', async () => {
      repository.update.mockResolvedValue(null);

      await expect(service.update(999, {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  it('removes a user', async () => {
    repository.remove.mockResolvedValue({ affected: 1 } as any);

    const result = await service.remove(1);

    expect(result).toEqual({ affected: 1 });
  });
});
