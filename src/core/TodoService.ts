import { ITodoRepository } from "./ITodoRepository";
import { IUserRepository } from "./IUserRepository";

export class TodoService {
  constructor(
    private todoRepo: ITodoRepository,
    private userRepo: IUserRepository
  ) {}

  async createTodo(data: any) {
    if (!data.userId) throw new Error("userId wajib diisi");
    if (!data.title || !data.title.trim()) throw new Error("Title wajib diisi");

    const user = await this.userRepo.findById(data.userId);
    if (!user) throw new Error("User tidak ditemukan");

    let remindAt: Date | undefined;
    if (data.remindAt) {
      const parsed = new Date(data.remindAt);
      if (isNaN(parsed.getTime())) throw new Error("Format reminderAt tidak valid");
      remindAt = parsed;
    }

    const todo = await this.todoRepo.create({
      userId: data.userId,
      title: data.title.trim(),
      description: data.description,
      status: "PENDING",
      remindAt,
    });

    return todo; 
  }

  async getTodosByUser(userId: string) {
    if (!userId) throw new Error("userId wajib diisi");

    const todos = await this.todoRepo.findByUserId(userId);
    return todos; 
  }

  async completeTodo(todoId: string) {
    if (!todoId) throw new Error("ID todo wajib diisi");

    const todo = await this.todoRepo.findById(todoId);
    if (!todo) throw new Error("Todo tidak ditemukan");

    if (todo.status === "DONE") return todo; 

    const updated = await this.todoRepo.update(todoId, {
      status: "DONE",
      updatedAt: new Date(),
    });

    if (!updated) throw new Error("Gagal memperbarui todo");

    return updated; 
  }

  async processReminders(now: Date = new Date()): Promise<void> {
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
    if (!userId) throw new Error("userId wajib diisi");

    const result = await this.todoRepo.findByUserIdPagination(
      userId,
      limit,
      offset
    );

    return {
      rows: result.rows,
      count: result.count,
    }; 
  }

  
  async deleteTodo(todoId: string) {
    if (!todoId) throw new Error("ID todo wajib diisi");

    const todo = await this.todoRepo.findById(todoId);
    if (!todo) throw new Error("Todo tidak ditemukan");

    if (todo.deletedAt !== null)
      throw new Error("Todo sudah dihapus sebelumnya");

    await this.todoRepo.deleteSoft(todoId);

    return; 
  }
}
