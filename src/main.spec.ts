import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

jest.mock('@nestjs/swagger', () => {
  const actual = jest.requireActual('@nestjs/swagger');

  return {
    ...actual,
    DocumentBuilder: jest.fn(),
    SwaggerModule: {
      ...actual.SwaggerModule,
      createDocument: jest.fn(),
      setup: jest.fn(),
    },
  };
});

describe('bootstrap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.PORT = '4567';
  });

  it('initializes the app, validation pipe and swagger docs', async () => {
    const listenMock = jest.fn().mockResolvedValue(undefined);
    const useGlobalPipesMock = jest.fn();
    const swaggerBuilderMock = {
      setTitle: jest.fn().mockReturnThis(),
      setDescription: jest.fn().mockReturnThis(),
      setVersion: jest.fn().mockReturnThis(),
      addBearerAuth: jest.fn().mockReturnThis(),
      build: jest.fn().mockReturnValue({}),
    };

    (NestFactory.create as jest.Mock).mockResolvedValue({
      listen: listenMock,
      useGlobalPipes: useGlobalPipesMock,
    });
    (DocumentBuilder as unknown as jest.Mock).mockImplementation(
      () => swaggerBuilderMock,
    );
    (SwaggerModule.createDocument as jest.Mock).mockReturnValue({});

    await jest.isolateModulesAsync(async () => {
      await import('./main');
    });

    expect(NestFactory.create).toHaveBeenCalledTimes(1);
    expect((NestFactory.create as jest.Mock).mock.calls[0][0].name).toBe(
      AppModule.name,
    );
    expect(useGlobalPipesMock).toHaveBeenCalledTimes(1);
    expect(DocumentBuilder).toHaveBeenCalledTimes(1);
    expect(swaggerBuilderMock.setTitle).toHaveBeenCalledWith(
      'POS SOAT Car Sales Core',
    );
    expect(SwaggerModule.createDocument).toHaveBeenCalledTimes(1);
    expect(SwaggerModule.setup).toHaveBeenCalledWith(
      'api/docs',
      { listen: listenMock, useGlobalPipes: useGlobalPipesMock },
      {},
    );
    expect(listenMock).toHaveBeenCalledWith('4567');
  });
});
