import { IUserRepository } from "./IUserRepository";

export class UserService {
    constructor(private userRepo: IUserRepository) {}

    async createUser(data: { email?: string; name?: string }) {
        if (!data.email || !data.email.trim()) {
            throw new Error("Email wajib diisi");
        }
        if (!data.name || !data.name.trim()) {
            throw new Error("Nama wajib diisi");
        }

        const email = data.email.trim();
        const existing = await this.userRepo.findByEmail(email);

        if (existing) {
            throw new Error("Email sudah digunakan");
        }

        const user = await this.userRepo.create({
            email,
            name: data.name.trim(),
        });

        return user;
    }

    async getUserById(id: string) {
        if (!id || !id.trim()) {
            throw new Error("ID user wajib diisi");
        }

        const user = await this.userRepo.findById(id);

        if (!user) {
            throw new Error("User tidak ditemukan");
        }

        return user;
    }

    async getAllUsers() {
        const users = await this.userRepo.findAll();
        return users;
    }
}
