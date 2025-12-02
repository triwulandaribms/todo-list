import express from "express";
import { SequelizeUserRepository } from "../infra/repository/UserRepository";
import { SequelizeTodoRepository } from "../infra/repository/TodoRepository";
import { SimpleScheduler } from "../infra/SimpleScheduler";
import { TodoService } from "../core/TodoService";
import { UserService } from "../core/UserService";
import { database } from "../infra/config/database";
import { createUserRoutes } from "../infra/routes/UserRoute";
import { createTodoRoutes } from "../infra/routes/TodoRoute";

async function bootstrap() {

  await database();

  const userRepo = new SequelizeUserRepository();
  const todoRepo = new SequelizeTodoRepository();
  const scheduler = new SimpleScheduler();

  const userService = new UserService(userRepo);
  const todoService = new TodoService(todoRepo, userRepo);

  scheduler.scheduleRecurring(
    "reminder-check",
    60000, 
    () => todoService.processReminders(new Date())
  );

  const app = express();
  app.use(express.json());

  app.use("/users", createUserRoutes(userService));
  app.use("/todos", createTodoRoutes(todoService));

  app.listen(3000, () => {
    console.log("Server berjalan di port 3000");
  });

}

bootstrap().catch(console.error);
