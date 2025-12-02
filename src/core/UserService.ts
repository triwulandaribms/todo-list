// import { User } from "../domain/User";
import { IUserRepository } from "./IUserRepository";

export class UserService {
    constructor(private userRepo: IUserRepository) {}

    async createUser(data: { email?: string; name?: string }) {
        try {
            if (!data.email || !data.email.trim()) {
                return { statusCode: 400, data: { error: "Email wajib diisi" } };
            }
            if (!data.name || !data.name.trim()) {
                return { statusCode: 400, data: { error: "Nama wajib diisi" } };
            }

            const email = data.email.trim();
            const existing = await this.userRepo.findByEmail(email);

            if (existing) {
                return { statusCode: 400, data: { error: "Email sudah digunakan" } };
            }

            const user = await this.userRepo.create({
                email,
                name: data.name.trim(),
            });

            return { statusCode: 201, data: user };
        } catch (error: any) {
            return {
                statusCode: 500,
                data: { error: error.message || "Internal server error" }
            };
        }
    }

    async getUserById(id: string) {
        try {
            if (!id || !id.trim()) {
                return { statusCode: 400, data: { error: "ID user wajib diisi" } };
            }

            const user = await this.userRepo.findById(id);

            if (!user) {
                return { statusCode: 404, data: { error: "User tidak ditemukan" } };
            }

            return { statusCode: 200, data: user };
        } catch (error: any) {
            return {
                statusCode: 500,
                data: { error: error.message || "Internal server error" }
            };
        }
    }

    async getAllUsers() {
        try {
            const users = await this.userRepo.findAll();
            return { statusCode: 200, data: users };
        } catch (error: any) {
            return {
                statusCode: 500,
                data: { error: error.message || "Internal server error" }
            };
        }
    }

}
