import App from "../../../../../src/core/presentation/app";
import { CheckedNotesEntity, UserEntity } from "../../../../../src/core/infra";
import Database from "../../../../../src/core/infra/data/connections/database";
import express, { Router } from "express";
import request from "supertest";
import IORedis from "ioredis";
import { v4 as uuid } from 'uuid';
import { CheckedNotesRoutes } from "../../../../../src/features/checked-notes/presentation/routes/routes";

jest.mock("ioredis");

const makeUserDB = async (): Promise<UserEntity> => {
    return await UserEntity.create({
        username: "any_username",
        password: "any_password",
    }).save();
}
const makeNotesDB = async (): Promise<CheckedNotesEntity[]> => {
    const user = await makeUserDB();

    const NoteA = await CheckedNotesEntity.create({
        title: "any_title",
        description: "any_description",
        userUid: user.uid,
    }).save();

    const NoteB = await CheckedNotesEntity.create({
        title: "any_title",
        description: "any_description",
        userUid: user.uid,
    }).save();

    return [NoteA, NoteB];
}

const makeNoteDB = async (): Promise<CheckedNotesEntity> => {
    const user = await makeUserDB();

    return await CheckedNotesEntity.create({
        title: "any_title",
        description: "any_description",
        userUid: user.uid
    }).save();
}

describe("Notes routes", () => {
    const server = new App().server;

    beforeAll(async () => {
        await new Database().openConnection();
        const router = Router();
        server.use(express.json());
        server.use(router);

        new CheckedNotesRoutes().init(router);
    });

    beforeEach(async () => {
        await UserEntity.clear();
        await CheckedNotesEntity.clear();
        jest.resetAllMocks();
    });


    describe("/GET:uid", () => {
        test("Deveria retornar uma lista de recados", async () => {
            const notes = await makeNotesDB();
        
            jest.spyOn(IORedis.prototype, "get").mockResolvedValue(null);
        
            await request(server)
              .get(`/checkednotes/user/${notes[0].userUid}`).send().expect(200)
                .expect((res) => {
                    expect((res.body as []).length).toBe(notes.length);
                    expect(res.body[0].cache).toBeFalsy();
                });
        });

        test("Deveria retornar uma lista de recados - CACHE", async () => {
            const notes = await makeNotesDB();
        
            jest.spyOn(IORedis.prototype, "get")
                .mockResolvedValue(JSON.stringify(notes));
        
            await request(server)
              .get(`/checkednotes/user/${notes[0].userUid}`).send().expect(200)
                .expect((res) => {
                    expect((res.body as []).length).toBe(notes.length);
                    expect(res.body[0].cache).toBeTruthy();
                });
        });

        test("Deveria retorn erro 500", async () => {
            const notes = await makeNotesDB();

            jest.spyOn(IORedis.prototype, "get").mockRejectedValue(null);

            await request(server).get(`/checkednotes/user/${notes[0].userUid}`).send().expect(500);
        });

        test("Deveria retornar um recado para um UID válido", async () => {
            const note = await makeNoteDB();

            jest.spyOn(IORedis.prototype, "get").mockResolvedValue(null);
            await request(server).get(`/checkednotes/${note.uid}`).send().expect(200)
                .expect((res) => {
                    expect(res.body.uid).toBe(note.uid);
                    expect(res.body.cache).toBeFalsy();
                });
        });

        test("Deveria retornar um recado para um UID válido - cache", async () => {
            const note = await makeNoteDB();

            jest.spyOn(IORedis.prototype, "get").mockResolvedValue(JSON.stringify(note));
            await request(server).get(`/checkednotes/${note.uid}`).send().expect(200)
                .expect((res) => {
                    expect(res.body.uid).toBe(note.uid);
                    expect(res.body.cache).toBeTruthy();
                });
        });

        test("Deveria retornar 404 quando o recado não existir", async () => {
            jest.spyOn(IORedis.prototype, "get").mockResolvedValue(null);

            await request(server).get(`/checkednotes/${uuid()}`).send().expect(404, {
                error: "No data found",
            });
        });
    });

    describe("/POST", () => {
        test("Deveria retornar status 400 ao tentrar salvar um usuario sem title", async () => {
                await request(server).post("/checkednotes")
                .send({
                    description: "any_description",
                    userUid: "any_useruid"
                }).expect(400, { error: 'Missing param: title' });
        });

        test("Deveria retornar status 400 ao tentrar salvar um usuario sem description", async () => {
            await request(server).post("/checkednotes")
            .send({
                title: "any_title",
                userUid: "any_useruid"
            }).expect(400, { error: 'Missing param: description' });
        });

        test("Deveria retornar status 400 ao tentrar salvar um usuario sem useruid", async () => {
            await request(server).post("/checkednotes")
            .send({
                title: "any_title",
                description: "any_description",
            }).expect(400, { error: 'Missing param: userUid' });
        });

        test("Deveria retornar 200 quando salvar o usuário", async () => {
            const user = await makeUserDB();

            await request(server)
              .post("/checkednotes")
              .send({
                title: "any_title",
                description: "any_description",
                userUid: user.uid
              })
              .expect(200)
              .expect((res) => {
                expect(res.body.uid).toBeTruthy();
                expect(res.body.title).toBe("any_title");
                expect(res.body.description).toBe("any_description");
                expect(res.body.userUid).toBe(user.uid);
              });
          });
    });

    describe("PUT", () => {
        test("Deveria alterar um recado e retorna-lo", async () => {
            const user = await makeUserDB();
            const note = await makeNoteDB();

            await request(server)
              .put(`/checkednotes/${note.uid}`)
              .send({
                title: "any_title",
                description: "any_description",
                userUid: user.uid
              })
              .expect(200)
              .expect((res) => {
                expect(res.body.title).toBe("any_title");
                expect(res.body.description).toBe("any_description");
                expect(res.body.userUid).toBe(user.uid);
                });
        });
    });

    describe("DELETE", () => {
        test("Deveria excluir um recado", async () => {
            const note = await makeNoteDB();

            await request(server).delete(`/checkednotes/${note.uid}`)
            .send().expect(200)
            .expect((res) => {
              expect(res.body.raw).toStrictEqual([]);
            });
        });
    });


});