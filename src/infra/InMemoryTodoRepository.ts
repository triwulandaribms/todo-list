import { Todo } from "../domain/Todo";
import { ITodoRepository } from "../core/ITodoRepository";

export class InMemoryTodoRepository implements ITodoRepository {
  private todos: Todo[] = [];

  async create(
    todoData: Omit<Todo, "id" | "createdAt" | "updatedAt">
  ): Promise<Todo> {
    const id = `todo-${Math.floor(Math.random() * 1000000)}`;
    const now = new Date();

    const todo: Todo = {
      ...todoData,
      id,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,    
    };

    this.todos.push(todo);
    return todo;
  }

  async update(
    id: string,
    updates: Partial<Omit<Todo, "id" | "userId" | "createdAt">>
  ): Promise<Todo | null> {
    const index = this.todos.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const old = this.todos[index];

    let newUpdatedAt = new Date();
    if (newUpdatedAt.getTime() <= old.updatedAt.getTime()) {
      newUpdatedAt = new Date(old.updatedAt.getTime() + 1);
    }

    const updated = {
      ...old,
      ...updates,
      updatedAt: newUpdatedAt,
    };

    this.todos[index] = updated;
    return updated;
  }

  async findById(id: string): Promise<Todo | null> {
    return this.todos.find((t) => t.id === id && t.deletedAt === null) || null;
  }

  async findByUserId(userId: string): Promise<Todo[]> {
    return this.todos.filter((t) => t.userId === userId && t.deletedAt === null);
  }

  async findDueReminders(currentTime: Date): Promise<Todo[]> {
    return this.todos.filter(
      (t) => 
        t.remindAt && t.remindAt <= currentTime && t.deletedAt === null && t.status === "PENDING"
    );
  }

  async deleteSoft(id: string): Promise<void> {
    const index = this.todos.findIndex((t) => t.id === id);
    if (index !== -1) {
      this.todos[index].deletedAt = new Date();
    }
  }

  async findByUserIdPagination(
    userId: string,
    limit: number,
    offset: number
  ): Promise<{ rows: Todo[]; count: number }> {
    const filtered = this.todos
      .filter((t) => t.userId === userId && t.deletedAt === null)
      .sort((a, b) => {
        const diff = b.createdAt.getTime() - a.createdAt.getTime();
        if (diff !== 0) return diff;

        const aNum = parseInt(a.title.replace("Task ", ""));
        const bNum = parseInt(b.title.replace("Task ", ""));
        return bNum - aNum;
      });

    const rows = filtered.slice(offset, offset + limit);

    return {
      rows,
      count: filtered.length,
    };
  }
}
