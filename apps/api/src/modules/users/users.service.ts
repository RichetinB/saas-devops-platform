import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async create(email: string, hashedPassword: string): Promise<User> {
    return this.usersRepository.create({ email, password: hashedPassword });
  }

  async findAll(): Promise<{ id: string; email: string; createdAt: Date }[]> {
    return this.usersRepository.findAll();
  }
}
