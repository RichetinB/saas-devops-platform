import { Injectable, NotFoundException } from '@nestjs/common';
import { TasksRepository } from './tasks.repository';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly tasksRepository: TasksRepository) {}

  async findAll(userId: string): Promise<Task[]> {
    return this.tasksRepository.findAll(userId);
  }

  async findById(id: string, userId: string): Promise<Task> {
    const task = await this.tasksRepository.findById(id, userId);
    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
    return task;
  }

  async create(userId: string, dto: CreateTaskDto): Promise<Task> {
    return this.tasksRepository.create({
      title: dto.title,
      user: { connect: { id: userId } },
    });
  }

  async update(id: string, userId: string, dto: UpdateTaskDto): Promise<Task> {
    await this.findById(id, userId);
    return this.tasksRepository.update(id, userId, dto);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.findById(id, userId);
    await this.tasksRepository.delete(id, userId);
  }
}
