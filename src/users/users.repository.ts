import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AppDataSource } from '../db/data-source';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersRepository {
  private async repository(): Promise<Repository<User>> {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    return AppDataSource.getRepository(User);
  }

  async create(createUserDto: CreateUserDto) {
    const repository = await this.repository();
    const user = repository.create({
      cpf: createUserDto.cpf,
      cnpj: createUserDto.cnpj,
      nome: createUserDto.nome,
      email: createUserDto.email,
      dataNascimento: createUserDto.dataNascimento,
    });

    return repository.save(user);
  }

  async findAll() {
    const repository = await this.repository();

    return repository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const repository = await this.repository();

    return repository.findOneBy({ id });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const repository = await this.repository();

    await repository.update(id, updateUserDto);

    return this.findOne(id);
  }

  async remove(id: number) {
    const repository = await this.repository();

    return repository.delete(id);
  }
}
