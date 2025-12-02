import { Router } from "express";
import { TodoService } from "../../core/TodoService";

export function createTodoRoutes(todoService: TodoService) {
  const router = Router();

  router.post("/add", async (req, res) => {
    const result = await todoService.createTodo(req.body);
    return res.status(result.statusCode).json(result.data);
  });

  router.get("/get", async (req, res) => {
    const result = await todoService.getTodosByUser(req.query.userId as string);
    return res.status(result.statusCode).json(result.data);
  });

  router.patch("/complete/:id/complete", async (req, res) => {
    const result = await todoService.completeTodo(req.params.id);
    return res.status(result.statusCode).json(result.data);
  });

  router.get("/get/pagination", async (req, res) => {
    const userId = req.query.userId as string;
    const limit = Number(req.query.limit || 10);
    const offset = Number(req.query.offset || 0);

    const result = await todoService.getTodosPagination(userId, limit, offset);
    return res.status(result.statusCode).json(result.data);
  });

  router.delete("/delete/:id", async (req, res) => {
    const result = await todoService.deleteTodo(req.params.id);
    return res.status(result.statusCode).json(result.data);
  });

  return router;
}
