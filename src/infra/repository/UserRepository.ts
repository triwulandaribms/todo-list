import { IUserRepository } from "../../core/IUserRepository";
import { User } from "../../domain/User";
import { UserModel } from "../models/UserModel";

export class SequelizeUserRepository implements IUserRepository {
  async create(data: Omit<User, "id" | "createdAt">): Promise<User> {
    const user = await UserModel.create({
      ...data,
      createdAt: new Date(),
    });
    return user.get();
  }

  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findByPk(Number(id));
    return user ? user.get() : null;
  }

  async findAll(): Promise<User[]> {
    const users = await UserModel.findAll();
    return users.map((u) => u.get());
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ where: { email } });
    return user ? user.get() : null;
  }
}
