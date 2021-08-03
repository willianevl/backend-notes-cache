import { UserEntity } from "../../../../core/infra";
import { User } from "../../domain";

export class UserRepository {
    async create(params: User): Promise<User> {
        const { username, password, confirmPassword } = params;
        
        const user = await UserEntity.create({
            username,
            password
        }).save();

        return Object.assign({}, params, user);
    }

    async getUser(uid: string): Promise<User | undefined> {
        const user = await UserEntity.findOne(uid);

        if(!user) return undefined;

        return {
            uid: user.uid,
            username: user.username,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        } as User;
    }

    async getUsers(): Promise<User[]> {
        const users = await UserEntity.find();

        return users.map((user) => {
            return {
                uid: user.uid,
                username: user.username,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            } as User;
        })
    }

    async update(uid: string, params: User): Promise<User> {
        const { username, password, confirmPassword } = params;

        const user = await UserEntity.update(uid, {
            username,
            password
        });

        return Object.assign({}, params, user);
    }

    async delete(uid: string) {
        return await UserEntity.delete(uid);
    }
}