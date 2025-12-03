import { Router } from "express";
import { TodoService } from "../../core/TodoService";

export function createTodoRoutes(todoService: TodoService) {
  const router = Router();

  router.post("/add", async (req, res) => {
    try {
      const todo = await todoService.createTodo(req.body);
      return res.status(201).json(todo);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  });

  router.get("/get", async (req, res) => {
    try {
      const todos = await todoService.getTodosByUser(req.query.userId as string);
      return res.status(200).json(todos);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  });

  router.patch("/complete/:id", async (req, res) => {
    try {
      const updated = await todoService.completeTodo(req.params.id);
      return res.status(200).json(updated);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  });

  router.get("/get/pagination", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const limit = Number(req.query.limit || 10);
      const offset = Number(req.query.offset || 0);

      const result = await todoService.getTodosPagination(userId, limit, offset);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  });

  router.delete("/delete/:id", async (req, res) => {
    try {
      await todoService.deleteTodo(req.params.id);
      return res.status(200).json({ message: "Deleted successfully" });
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  });

  return router;
}
