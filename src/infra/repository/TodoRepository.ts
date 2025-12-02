import { ITodoRepository } from "../../core/ITodoRepository";
import { Todo } from "../../domain/Todo";
import { TodoModel } from "../models/TodoModel";
import { Op } from "sequelize";

export class SequelizeTodoRepository implements ITodoRepository {

  async create(data: Omit<Todo, "id" | "createdAt" | "updatedAt">): Promise<Todo> {
    const t = await TodoModel.create({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return t.get();
  }

  async findById(id: string): Promise<Todo | null> {
    const t = await TodoModel.findByPk(Number(id));
    return t ? t.get() : null;
  }

  async update(id: string, updates: Partial<Todo>): Promise<Todo | null> {
    const todo = await TodoModel.findByPk(Number(id));
    if (!todo) return null;

    await todo.update({ ...updates, updatedAt: new Date() });
    return todo.get();
  }

  async findByUserId(userId: string): Promise<Todo[]> {
    const todos = await TodoModel.findAll({
      where: { userId: Number(userId) }
    });
    return todos.map(t => t.get());
  }

  async findDueReminders(now: Date): Promise<Todo[]> {
    const todos = await TodoModel.findAll({
      where: {
        status: "PENDING",
        remindAt: { [Op.lte]: now }
      }
    });

    return todos.map(t => t.get());
  }

  async deleteSoft(id: string): Promise<void> {
    await TodoModel.update(
      { deletedAt: new Date() },
      { where: { id } }
    );
  }

  async findByUserIdPagination(
    userId: string,
    limit: number,
    offset: number
  ): Promise<{ rows: Todo[]; count: number }> {

    const { rows, count } = await TodoModel.findAndCountAll({
      where: {
        userId,
        deletedAt: null,
      },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return {
      rows: rows.map(r => r.get()),
      count
    };
  }



}
