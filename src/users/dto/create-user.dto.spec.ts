import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto', () => {
  it('exposes the default sample values', () => {
    const dto = new CreateUserDto();

    expect(dto.cpf).toBe('12345678901');
    expect(dto.cnpj).toBe('12345678000199');
    expect(dto.nome).toBe('Maria Silva');
    expect(dto.email).toBe('maria.silva@example.com');
    expect(dto.dataNascimento).toBe('1995-08-15');
  });
});
