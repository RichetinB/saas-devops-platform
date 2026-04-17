import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Task, Prisma } from '@prisma/client';

@Injectable()
export class TasksRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string): Promise<Task[]> {
    return this.prisma.task.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async findById(id: string, userId: string): Promise<Task | null> {
    return this.prisma.task.findFirst({ where: { id, userId } });
  }

  async create(data: Prisma.TaskCreateInput): Promise<Task> {
    return this.prisma.task.create({ data });
  }

  async update(id: string, userId: string, data: Prisma.TaskUpdateInput): Promise<Task> {
    return this.prisma.task.update({ where: { id, userId }, data });
  }

  async delete(id: string, userId: string): Promise<Task> {
    return this.prisma.task.delete({ where: { id, userId } });
  }
}
