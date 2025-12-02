
import { ITodoRepository } from "./ITodoRepository";
import { IUserRepository } from "./IUserRepository";

export class TodoService {
  constructor(
    private todoRepo: ITodoRepository,
    private userRepo: IUserRepository
  ) { }

  async createTodo(data: any) {
    try {
      if (!data.userId) {
        return { statusCode: 400, data: { error: "userId wajib diisi" } };
      }

      if (!data.title || !data.title.trim()) {
        return { statusCode: 400, data: { error: "Title wajib diisi" } };
      }

      const user = await this.userRepo.findById(data.userId);
      if (!user) {
        return { statusCode: 404, data: { error: "User tidak ditemukan" } };
      }

      let remindDate;
      if (data.remindAt) {
        const parsed = new Date(data.remindAt);
        if (isNaN(parsed.getTime())) {
          return { statusCode: 400, data: { error: "Format reminderAt tidak valid" } };
        }
        remindDate = parsed;
      }

      const todo = await this.todoRepo.create({
        userId: data.userId,
        title: data.title.trim(),
        description: data.description,
        status: "PENDING",
        remindAt: remindDate,
      });

      return { statusCode: 201, data: todo };

    } catch (err: any) {
      return { statusCode: 500, data: { error: err.message } };
    }
  }

  async getTodosByUser(userId: string) {
    try {
      if (!userId) {
        return { statusCode: 400, data: { error: "userId wajib diisi" } };
      }

      const todos = await this.todoRepo.findByUserId(userId);
      return { statusCode: 200, data: todos };

    } catch (err: any) {
      return { statusCode: 500, data: { error: err.message } };
    }
  }

  async completeTodo(todoId: string) {
    try {
      if (!todoId) {
        return { statusCode: 400, data: { error: "ID todo wajib diisi" } };
      }

      const todo = await this.todoRepo.findById(todoId);
      if (!todo) {
        return { statusCode: 404, data: { error: "Todo tidak ditemukan" } };
      }

      if (todo.status === "DONE") {
        return { statusCode: 200, data: todo };
      }

      const updated = await this.todoRepo.update(todoId, {
        status: "DONE",
        updatedAt: new Date(),
      });

      if (!updated) {
        return { statusCode: 500, data: { error: "Gagal memperbarui todo" } };
      }

      return { statusCode: 200, data: updated };

    } catch (err: any) {
      return { statusCode: 500, data: { error: err.message } };
    }
  }

  async processReminders(now = new Date()): Promise<void> {

    const dueTodos = await this.todoRepo.findDueReminders(now);

    for (const t of dueTodos) {
      if (t.status === "DONE") continue;

      await this.todoRepo.update(t.id, {
        status: "REMINDER_DUE",
        updatedAt: new Date(),
      });
    }
  }

  async getTodosPagination(userId: string, limit: number, offset: number) {
    try {
      if (!userId) {
        return { statusCode: 400, data: { error: "userId wajib diisi" } };
      }

      const result = await this.todoRepo.findByUserIdPagination(
        userId,
        limit,
        offset
      );

      return {
        statusCode: 200,
        data: {
          total: result.count,
          limit,
          offset,
          data: result.rows,
        }
      };

    } catch (err: any) {
      return { statusCode: 500, data: { error: err.message } };
    }
  }

  async deleteTodo(todoId: string) {
    try {
      if (!todoId) {
        return { statusCode: 400, data: { error: "ID todo wajib diisi" } };
      }
  
      const todo = await this.todoRepo.findById(todoId);
  
      if (!todo) {
        return { statusCode: 404, data: { error: "Todo tidak ditemukan" } };
      }
  
      if (todo.deletedAt !== null) {
        return { statusCode: 400, data: { error: "Todo sudah dihapus sebelumnya" } };
      }
  
      await this.todoRepo.deleteSoft(todoId);
  
      return {
        statusCode: 200,
        data: { message: "Todo berhasil dihapus" }
      };
  
    } catch (err: any) {
      return { statusCode: 500, data: { error: err.message } };
    }
  }
  

}

