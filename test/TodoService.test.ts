import { TodoService } from "../src/core/TodoService";
import { InMemoryTodoRepository } from "../src/infra/InMemoryTodoRepository";
import { InMemoryUserRepository } from "../src/infra/InMemoryUserRepository";
import { User } from "../src/domain/User";

describe("TodoService", () => {
  let todoService: TodoService;
  let todoRepo: InMemoryTodoRepository;
  let userRepo: InMemoryUserRepository;
  let testUser: User;

  beforeEach(async () => {
    todoRepo = new InMemoryTodoRepository();
    userRepo = new InMemoryUserRepository();
    todoService = new TodoService(todoRepo, userRepo);

    testUser = await userRepo.create({
      email: "test@example.com",
      name: "Test User",
    });
  });

  describe("createTodo - happy path", () => {
    it("should create a todo with valid data", async () => {
      const todoData = {
        userId: testUser.id,
        title: "Buy groceries",
        description: "Milk, eggs, bread",
      };

      const todo = await todoService.createTodo(todoData);

      expect(todo).toBeDefined();
      expect(todo.id).toBeDefined();
      expect(todo.userId).toBe(testUser.id);
      expect(todo.title).toBe("Buy groceries");
      expect(todo.description).toBe("Milk, eggs, bread");
      expect(todo.status).toBe("PENDING");
      expect(todo.createdAt).toBeInstanceOf(Date);
      expect(todo.updatedAt).toBeInstanceOf(Date);
    });

    it("should create a todo with reminder date", async () => {
      const remindAt = new Date(Date.now() + 3600000); 
      const todoData = {
        userId: testUser.id,
        title: "Call dentist",
        remindAt: remindAt.toISOString(),
      };

      const todo = await todoService.createTodo(todoData);

      expect(todo.remindAt).toBeDefined();
      expect(todo.remindAt?.getTime()).toBe(remindAt.getTime());
    });
  });

  describe("createTodo - edge cases", () => {
    it("should reject todo with empty title", async () => {
      const todoData = {
        userId: testUser.id,
        title: "",
        description: "This should fail",
      };

      await expect(todoService.createTodo(todoData)).rejects.toThrow();
    });

    it("should reject todo with whitespace-only title", async () => {
      const todoData = {
        userId: testUser.id,
        title: "   ",
        description: "This should also fail",
      };

      await expect(todoService.createTodo(todoData)).rejects.toThrow();
    });

    it("should reject todo for non-existent user", async () => {
      const todoData = {
        userId: "non-existent-user-id",
        title: "This should fail",
        description: "User does not exist",
      };

      await expect(todoService.createTodo(todoData)).rejects.toThrow();
    });
  });

  describe("completeTodo - happy path", () => {
    it("should mark a pending todo as done", async () => {
      const todo = await todoService.createTodo({
        userId: testUser.id,
        title: "Task to complete",
      });

      const completed = await todoService.completeTodo(todo.id);

      expect(completed.status).toBe("DONE");
      expect(completed.updatedAt.getTime()).toBeGreaterThan(
        todo.updatedAt.getTime()
      );
    });

    it("should be idempotent when completing already done todo", async () => {
      const todo = await todoService.createTodo({
        userId: testUser.id,
        title: "Task to complete",
      });

      const completed1 = await todoService.completeTodo(todo.id);
      const completed2 = await todoService.completeTodo(todo.id);

      expect(completed2.status).toBe("DONE");
      expect(completed2.id).toBe(completed1.id);
    });
  });

  describe("processReminders - happy path", () => {
    it("should mark due reminders as REMINDER_DUE", async () => {
      const pastDate = new Date(Date.now() - 3600000); 

      const todo = await todoService.createTodo({
        userId: testUser.id,
        title: "Overdue task",
        remindAt: pastDate.toISOString(),
      });

      await todoService.processReminders();

      const todos = await todoService.getTodosByUser(testUser.id);
      const processedTodo = todos.find((t) => t.id === todo.id);

      expect(processedTodo?.status).toBe("REMINDER_DUE");
    });

    it("should not process future reminders", async () => {
      const futureDate = new Date(Date.now() + 3600000); 

      const todo = await todoService.createTodo({
        userId: testUser.id,
        title: "Future task",
        remindAt: futureDate.toISOString(),
      });

      await todoService.processReminders();

      const todos = await todoService.getTodosByUser(testUser.id);
      const processedTodo = todos.find((t) => t.id === todo.id);

      expect(processedTodo?.status).toBe("PENDING");
    });
  });

  describe("processReminders - edge cases", () => {
    it("should ignore DONE todos when processing reminders", async () => {
      const pastDate = new Date(Date.now() - 3600000);

      const todo = await todoService.createTodo({
        userId: testUser.id,
        title: "Completed task with past reminder",
        remindAt: pastDate.toISOString(),
      });

      await todoService.completeTodo(todo.id);
      await todoService.processReminders();

      const todos = await todoService.getTodosByUser(testUser.id);
      const processedTodo = todos.find((t) => t.id === todo.id);

      // Should remain DONE, not changed to REMINDER_DUE
      expect(processedTodo?.status).toBe("DONE");
    });

    it("should be idempotent - processing reminders multiple times", async () => {
      const pastDate = new Date(Date.now() - 3600000);

      const todo = await todoService.createTodo({
        userId: testUser.id,
        title: "Task with reminder",
        remindAt: pastDate.toISOString(),
      });

      await todoService.processReminders();
      const todos1 = await todoService.getTodosByUser(testUser.id);
      const todo1 = todos1.find((t) => t.id === todo.id);

      await todoService.processReminders();
      const todos2 = await todoService.getTodosByUser(testUser.id);
      const todo2 = todos2.find((t) => t.id === todo.id);

      expect(todo2?.status).toBe("REMINDER_DUE");
      expect(todo2?.status).toBe(todo1?.status);
    });
  });

  describe("getTodosByUser - happy path", () => {
    it("should return all todos for a user", async () => {
      await todoService.createTodo({
        userId: testUser.id,
        title: "Task 1",
      });

      await todoService.createTodo({
        userId: testUser.id,
        title: "Task 2",
      });

      const todos = await todoService.getTodosByUser(testUser.id);

      expect(todos).toHaveLength(2);
      expect(todos.every((t) => t.userId === testUser.id)).toBe(true);
    });

    it("should return empty array for user with no todos", async () => {
      const anotherUser = await userRepo.create({
        email: "another@example.com",
        name: "Another User",
      });

      const todos = await todoService.getTodosByUser(anotherUser.id);

      expect(todos).toHaveLength(0);
    });
  });


  describe("soft delete & pagination", () => {

    describe("soft delete", () => {
      it("should soft-delete a todo", async () => {
        const todo = await todoService.createTodo({
          userId: testUser.id,
          title: "Task to delete",
        });
  
        await todoService.deleteTodo(todo.id);
  
        const todos = await todoService.getTodosByUser(testUser.id);
  
        expect(todos.find(t => t.id === todo.id)).toBeUndefined();
      });

      it("should throw error when deleting non-existent todo", async () => {
        await expect(todoService.deleteTodo("nonexistent-id"))
          .rejects
          .toThrow("Todo tidak ditemukan");
      });
    });
  
    
    describe("pagination", () => {
      beforeEach(async () => {
        for (let i = 1; i <= 15; i++) {
          await todoService.createTodo({
            userId: testUser.id,
            title: `Task ${i}`,
          });
        }
      });
  
      it("should return correct number of items with limit", async () => {
        const { rows, count } = await todoService.getTodosPagination(
          testUser.id,
          5, 
          0  
        );
  
        expect(count).toBe(15);   
        expect(rows.length).toBe(5);
      });
  
      it("should return correct page using offset", async () => {
        const { rows } = await todoService.getTodosPagination(
          testUser.id,
          5,  
          5    
        );
  
        expect(rows.length).toBe(5);
        expect(rows[0].title).toBe("Task 10"); 
      });
  
      it("should return empty array when offset is past total", async () => {
        const { rows } = await todoService.getTodosPagination(
          testUser.id,
          5,
          100 
        );
  
        expect(rows.length).toBe(0);
      });
  
      it("should not include soft-deleted todos in pagination", async () => {
        const todos = await todoService.getTodosPagination(testUser.id, 5, 0);
  
        await todoService.deleteTodo(todos.rows[0].id);
  
        const afterDelete = await todoService.getTodosPagination(testUser.id, 20, 0);
  
        expect(afterDelete.count).toBe(14);   
        expect(afterDelete.rows.length).toBe(14);
      });
    });
  
  });
  
});
