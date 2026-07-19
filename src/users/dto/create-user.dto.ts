import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @ApiPropertyOptional({
    default: '12345678901',
    example: '12345678901',
    description: 'CPF do usuário, quando aplicável (somente números)',
  })
  @IsOptional()
  @Length(11, 11)
  cpf?: string = '12345678901';

  @ApiPropertyOptional({
    default: '12345678000199',
    example: '12345678000199',
    description: 'CNPJ do usuário, quando aplicável (somente números)',
  })
  @IsOptional()
  @Length(14, 14)
  cnpj?: string = '12345678000199';

  @ApiProperty({
    default: 'Maria Silva',
    example: 'Maria Silva',
    description: 'Nome completo do usuário',
  })
  @IsString()
  nome: string = 'Maria Silva';

  @ApiProperty({
    default: 'maria.silva@example.com',
    example: 'maria.silva@example.com',
    description: 'E-mail do usuário',
  })
  @IsEmail()
  email: string = 'maria.silva@example.com';

  @ApiPropertyOptional({
    default: '1995-08-15',
    example: '1995-08-15',
    description: 'Data de nascimento no formato YYYY-MM-DD',
  })
  @IsOptional()
  @IsString()
  dataNascimento?: string = '1995-08-15';
}
