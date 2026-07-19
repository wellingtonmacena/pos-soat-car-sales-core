import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const serviceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: serviceMock }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('creates a user', async () => {
    const dto = { nome: 'Maria Silva', email: 'maria.silva@example.com' };
    service.create.mockResolvedValue({ id: 1, ...dto } as any);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: 1, ...dto });
  });

  it('finds all users', async () => {
    service.findAll.mockResolvedValue([{ id: 1 } as any]);

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual([{ id: 1 }]);
  });

  it('finds one user', async () => {
    service.findOne.mockResolvedValue({ id: 1 } as any);

    const result = await controller.findOne('1');

    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(result).toEqual({ id: 1 });
  });

  it('updates a user', async () => {
    const dto = { nome: 'Maria Souza' };
    service.update.mockResolvedValue({ id: 1, ...dto } as any);

    const result = await controller.update('1', dto);

    expect(service.update).toHaveBeenCalledWith(1, dto);
    expect(result).toEqual({ id: 1, ...dto });
  });

  it('removes a user', async () => {
    service.remove.mockResolvedValue({ affected: 1 } as any);

    const result = await controller.remove('1');

    expect(service.remove).toHaveBeenCalledWith(1);
    expect(result).toEqual({ affected: 1 });
  });
});
