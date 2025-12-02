import { Router } from "express";
import { UserService } from "../../core/UserService";

export function createUserRoutes(userService: UserService) {
  const router = Router();

  router.post("/add", async (req, res) => {
    const result = await userService.createUser(req.body);
    return res.status(result.statusCode).json(result.data);
  });

  router.get("/get/:id", async (req, res) => {
    const result = await userService.getUserById(req.params.id);
    return res.status(result.statusCode).json(result.data);
  });

  router.get("/get-all", async (_req, res) => {
    const result = await userService.getAllUsers();
    return res.status(result.statusCode).json(result.data);
  });

  return router;
}
