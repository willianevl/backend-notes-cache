import App from "../../../../../src/core/presentation/app";
import { UserEntity } from "../../../../../src/core/infra";
import Database from "../../../../../src/core/infra/data/connections/database";
import express, { Router } from "express";
import request from "supertest";
import { UserRoutes } from "../../../../../src/features/user/presentation/routes/routes";
import IORedis from "ioredis";
import { v4 as uuid } from 'uuid';

jest.mock("ioredis");

const makeUsersDB = async (): Promise<UserEntity[]> => {
    const userA = await UserEntity.create({
        username: "any_usernameA",
        password: "any_password"
    }).save();

    const userB = await UserEntity.create({
        username: "any_usernameB",
        password: "any_password"
    }).save();

    return [userA, userB];
}

const makeUserDB = async (): Promise<UserEntity> => {
    return await UserEntity.create({
        username: "any_username",
        password: "any_password"
    }).save();
}

describe("User routes", () => {
    const server = new App().server;

    beforeAll(async () => {
        await new Database().openConnection();
        const router = Router();
        server.use(express.json());
        server.use(router);

        new UserRoutes().init(router)
    });

    beforeEach(async () => {
        await UserEntity.clear();
        jest.resetAllMocks();
    });

    describe("/GET", () => {
        test("Deveria retornar uma lista de usuários", async () => {
            const users = await makeUsersDB();
        
            jest.spyOn(IORedis.prototype, "get").mockResolvedValue(null);
        
            await request(server)
              .get("/user").send().expect(200)
                .expect((res) => {
                    expect((res.body as []).length).toBe(users.length);
                    expect(res.body[0].cache).toBeFalsy();
                });
        });

        test("Deveria retornar uma lista de usuários - CACHE", async () => {
            const users = await makeUsersDB();
        
            jest.spyOn(IORedis.prototype, "get")
                .mockResolvedValue(JSON.stringify(users));
        
            await request(server)
              .get("/user").send().expect(200)
                .expect((res) => {
                    expect((res.body as []).length).toBe(users.length);
                    expect(res.body[0].cache).toBeTruthy();
                });
        });

        test("Deveria retorn erro 500", async () => {
            jest.spyOn(IORedis.prototype, "get").mockRejectedValue(null);

            await request(server).get("/user").send().expect(500);
        });
    });

    describe("/GET:uid", () => {
        test("Deveria retornar um usuário para um UID válido", async () => {
            const user = await makeUserDB();

            jest.spyOn(IORedis.prototype, "get").mockResolvedValue(null);
            await request(server).get(`/user/${user.uid}`).send().expect(200)
                .expect((res) => {
                    expect(res.body.uid).toBe(user.uid);
                    expect(res.body.cache).toBeFalsy();
                });
        });

        test("Deveria retornar um usuário para um UID válido - cache", async () => {
            const user = await makeUserDB();

            jest.spyOn(IORedis.prototype, "get").mockResolvedValue(JSON.stringify(user));
            await request(server).get(`/user/${user.uid}`).send().expect(200)
                .expect((res) => {
                    expect(res.body.uid).toBe(user.uid);
                    expect(res.body.cache).toBeTruthy();
                });
        });

        test("Deveria retornar 404 quando o usuário não existir", async () => {
            jest.spyOn(IORedis.prototype, "get").mockResolvedValue(null);

            await request(server).get(`/user/${uuid()}`).send().expect(404, {
                error: "No data found",
            });
        });
    });

    describe("/POST", () => {
        test("Deveria retornar status 400 ao tentrar salvar um usuario sem username", async () => {
                await request(server).post("/user")
                .send({
                    password: "any_password",
                }).expect(400, { error: 'Missing param: username' });
        });

        test("Deveria retornar status 400 ao tentrar salvar um usuario sem password", async () => {
            await request(server).post("/user")
            .send({
                username: "any_username",
                confirmPassword: "any_password"
            }).expect(400, { error: 'Missing param: password' });
        });

        test("Deveria retornar status 400 ao tentrar salvar um usuario sem confirmPassword", async () => {
            await request(server).post("/user")
            .send({
                username: "any_username",
                password: "any_password"
            }).expect(400, { error: 'Missing param: confirmPassword' });
        });

        test("Deveria retornar status 400 quando as duas senhas nao coincidem", async () => {
            await request(server).post("/user")
            .send({
                username: "any_username",
                password: "any_password",
                confirmPassword: "any_paswword"
            }).expect(400, { error: 'Invalid param: confirmPassword' });
        });

        test("Deveria retornar status 400 quando já existir um usuário com o mesmo username", async () => {
            await makeUserDB();

            await request(server).post("/user")
            .send({
                username: "any_username",
                password: "any_password",
                confirmPassword: "any_password"
            }).expect(400, { error: 'User already exists with these data' });
        });

        test("Deveria retornar 200 quando salvar o usuário", async () => {
            await request(server)
              .post("/user")
              .send({
                username: "any_username",
                password: "any_password",
                confirmPassword: "any_password"
              })
              .expect(200)
              .expect((res) => {
                expect(res.body.uid).toBeTruthy();
                expect(res.body.username).toBe("any_username");
                expect(res.body.password).toBe("any_password");
              });
          });
    });

    describe("PUT", () => {
        test("Deveria alterar um usuário e retorna-lo", async () => {
            const user = await makeUserDB();

            await request(server)
              .put(`/user/${user.uid}`)
              .send({
                username: "any_username(Update)",
                password: "any_password",
                confirmPassword: "any_password",
              })
              .expect(200)
              .expect((res) => {
                expect(res.body.username).toBe("any_username(Update)");
                expect(res.body.password).toBe("any_password");
                });
        });

        test("Deveria retornar status 400 ao tentrar salvar um usuario sem username", async () => {
            const user = await makeUserDB();

            await request(server).put(`/user/${user.uid}`)
            .send({
                password: "any_password",
            }).expect(400, { error: 'Missing param: username' });
        });

        test("Deveria retornar status 400 ao tentrar salvar um usuario sem password", async () => {
            const user = await makeUserDB();

                await request(server).put(`/user/${user.uid}`)
            .send({
                username: "any_username",
                confirmPassword: "any_password"
            }).expect(400, { error: 'Missing param: password' });
        });

        test("Deveria retornar status 400 ao tentrar salvar um usuario sem confirmPassword", async () => {
            const user = await makeUserDB();

            await request(server).put(`/user/${user.uid}`)
            .send({
                username: "any_username",
                password: "any_password"
            }).expect(400, { error: 'Missing param: confirmPassword' });
        });

        test("Deveria retornar status 400 quando as duas senhas nao coincidem", async () => {
            const user = await makeUserDB();

                await request(server).put(`/user/${user.uid}`)
                .send({
                username: "any_username",
                password: "any_password",
                confirmPassword: "any_paswword"
            }).expect(400, { error: 'Invalid param: confirmPassword' });
        });

        test("Deveria retornar status 400 quando já existir um usuário com o mesmo username", async () => {
            const user = await makeUserDB();
            await makeUsersDB();

                await request(server).put(`/user/${user.uid}`)
            .send({
                username: "any_usernameA",
                password: "any_password",
                confirmPassword: "any_password"
            }).expect(400, { error: 'User already exists with these data' });
        });
    });

    describe("DELETE", () => {
        test("Deveria excluir um recado", async () => {
            const user = await makeUserDB();

            await request(server).delete(`/user/${user.uid}`)
            .send().expect(200)
            .expect((res) => {
              expect(res.body.raw).toStrictEqual([]);
            });
        });
    });


});