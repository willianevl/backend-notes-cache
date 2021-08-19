import { UserRepository } from '../../../../../src/features/user/infra';
import { UserEntity } from '../../../../../src/core/infra';
import Database from '../../../../../src/core/infra/data/connections/database';
import { User } from '../../../../../src/features/user/domain';
import { v4 as uuid } from 'uuid';

const makeCreateParams = async (): Promise<User> => {
    return {
        username: "any_username",
        password: "any_password",
        confirmPassword: "any_password",
    };
};

const makeUsersDB = async (): Promise<UserEntity[]> => {
    const userA = await UserEntity.create({
        username: "any_usernameA",
        password: "any_password",
    }).save();

    const userB = await UserEntity.create({
        username: "any_usernameB",
        password: "any_password",
    }).save();

    return [userA, userB];
};

const makeUserDB = async (): Promise<UserEntity> => {
    return await UserEntity.create({
        username: "any_usernameA",
        password: "any_password"
    }).save();
};

const makeUpdateParams = async (): Promise<User> => {
    return {
        username: "any_username",
        password: "any_password",
    };
};

describe("User Repository", () => {
    beforeAll(async () => {
        await new Database().openConnection();
    });

    beforeEach(async () => {
        await UserEntity.clear()
    });

    afterAll(async () => {
        await new Database().disconnectDatabase();
    });

    describe("create", () => {
        test("Deveria retornar um projeto quando obtiver sucesso", async () => {
          const sut = new UserRepository();
          const params = await makeCreateParams();
          const result = await sut.create(params);
    
          expect(result).toBeTruthy();
          expect(result.uid).toBeTruthy();
          expect(result.username).toBe("any_username");
          expect(result.password).toBe("any_password");
        });
    });

    describe("Get Users", () => {
        test("Deveria retornar uma lista de usuários", async () => {
            const sut = new UserRepository();
            const users = await makeUsersDB();
            const result = await sut.getUsers();

            expect(result).toBeTruthy();
            expect(result.length).toBe(users.length);
            expect(result[0].updatedAt).toStrictEqual(users[0].updatedAt);
        });
    });

    describe("Get User", () => {
        test("Deveria retornar undefined quando o UID for inexistente", async () => {
            const sut = new UserRepository();
            const result = await sut.getUser(uuid());

            expect(result).toBeFalsy();
        });

        test("Deveria retornar um usuário quando obtiver um UID válido", async () => {
            const sut = new UserRepository();
            const user = await makeUserDB();

            const result = await sut.getUser(user.uid);

            expect(result).toBeTruthy();
            expect(result?.uid).toBe(user.uid);
            expect(result?.username).toBe(user.username);
            expect(result?.createdAt).toStrictEqual(user.createdAt);
            expect(result?.updatedAt).toStrictEqual(user.updatedAt);
        });
    });

    describe("Update", () => {
        test("Deveria att um usuário para um UID válido", async () => {
          const sut = new UserRepository();
          const user = await makeUserDB();
          const params = await makeUpdateParams();
    
          const result = await sut.update(user.uid, params);
    
          expect(result).toBeTruthy();
        });
    });

    describe("Delete", () => {
        test("Deveria excluir um usuário caso uid seja válido", async () => {
            const sut = new UserRepository();
            const user = await makeUserDB();

            const result = await sut.delete(user.uid);

            expect(result).toBeTruthy();
        });
    });
});