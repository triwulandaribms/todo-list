import { Router } from "express";
import { UserService } from "../../core/UserService";

export function createUserRoutes(userService: UserService) {
  const router = Router();

  router.post("/add", async (req, res) => {
    try {
      const user = await userService.createUser(req.body);
      return res.status(201).json(user);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  router.get("/get/:id", async (req, res) => {
    try {
      const user = await userService.getUserById(req.params.id);
      return res.status(200).json(user);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  router.get("/get-all", async (_req, res) => {
    try {
      const users = await userService.getAllUsers();
      return res.status(200).json(users);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  return router;
}
