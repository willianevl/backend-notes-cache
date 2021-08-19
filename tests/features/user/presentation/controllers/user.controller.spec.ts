
import { DataNotFoundError, HttpRequest, notFound, ok, serverError } from "../../../../../src/core/presentation";
import { CacheRepository } from "../../../../../src/core/infra";
import { UserRepository } from "../../../../../src/features/user/infra";
import { UserController } from "../../../../../src/features/user/presentation/controllers";
import { v4 as uuid } from 'uuid';
import { DeleteResult } from "typeorm";

const makeSut = (): UserController => new UserController(new UserRepository(), new CacheRepository());

const makeRequestStore = (): HttpRequest => ({
    body: {
        username: "any_username",
        password: "any_password",
    },
    params: {},
});

const makeUserResult = () => ({
    uid: "any_uid",
    username: "any_username",
    password: "any_password",
});

const makeRequestUid = (): HttpRequest => ({
    params: { uid: "any_uid" },
    body: {},
});

const makeRequestUpdate = (): HttpRequest => ({
    body: {
        username: "any_username",
        password: "any_password"
    },
    params: {uid: "any_uid"}
});

const makeDeleteResult = (): DeleteResult => {
    return {
        raw: "any_raw",
        affected: 1 | 0
    };
}

describe("User Controller", () => {
    describe("Store", () => {
        test("Deveria retornar status 500 se houver erro", async () => {
            jest.spyOn(UserRepository.prototype, "create").
            mockRejectedValue(new Error());

            const sut = makeSut();
            const result = await sut.store(makeRequestStore());
            expect(result).toEqual(serverError());
        });

        test("Deveria chamar o Repositorio com valores corretos", async () => {
            const createSpy = jest.spyOn(UserRepository.prototype, "create")
                .mockResolvedValue(makeRequestStore().body);

            const delSpy = jest.spyOn(CacheRepository.prototype, "del")
                .mockResolvedValue(true);

            const sut = makeSut();
            const data = makeRequestStore()
            await sut.store(data);

            expect(delSpy).toHaveBeenCalledWith("users:all");
            expect(createSpy).toHaveBeenCalledWith(makeRequestStore().body);
        });

        test("Deveria apagar o cache do redis", async () => {
            const delSpy = jest.spyOn(CacheRepository.prototype, "del")
                .mockResolvedValue(true);

            const sut = makeSut();
            const data = makeRequestStore();
            await sut.store(data);

            expect(delSpy).toHaveBeenCalledWith("users:all")
        });
    });

    describe("Show", () => {
        test("Deveria retornar status 500 se houver erro", async () => {
            jest.spyOn(CacheRepository.prototype, "get").
            mockRejectedValue(new Error());

            const sut = makeSut();
            const result = await sut.show(makeRequestUid());
            expect(result).toEqual(serverError());
        });

        test("Deveria retornar status 404 se o usuario não existir", async () => {
            jest.spyOn(CacheRepository.prototype, "get").mockResolvedValue(null);
            
            jest.spyOn(UserRepository.prototype, "getUser")
            .mockResolvedValue(undefined);

            const sut = makeSut();
            const result = await sut.show(makeRequestUid());

            expect(result).toEqual(notFound(new DataNotFoundError()));
        });

        test("Deveria retornar o usuario com status 200", async () => {
            const getSpy = jest.spyOn(CacheRepository.prototype, "get").mockResolvedValue(null);
            const setSpy = jest.spyOn(CacheRepository.prototype, "set").mockResolvedValue(null);

            jest.spyOn(UserRepository.prototype, "getUser")
            .mockResolvedValue(makeUserResult());

            const sut = makeSut();
            const result = await sut.show(makeRequestUid());

            expect(result).toEqual(ok(makeUserResult()));
            expect(getSpy).toHaveBeenCalledWith(`user:${makeUserResult().uid}`)
            expect(setSpy).toHaveBeenCalledWith(
                `user:${makeUserResult().uid}`, makeUserResult()
            );
        });

        test("Deveria retornar 200 se o projeto existir em cache", async () => {
            const getSpy = jest.spyOn(CacheRepository.prototype, "get")
            .mockResolvedValue(makeUserResult());

            const sut = makeSut();
            const result = await sut.show(makeRequestUid());

            expect(result).toEqual(ok(Object.assign({}, makeUserResult(), {cache: true})));

            expect(getSpy).toHaveBeenLastCalledWith(
                `user:${makeUserResult().uid}`
              );
        });
    });

    describe("Index", () => {
        test("Deveria retornar erro 500", async () => {
            jest
            .spyOn(CacheRepository.prototype, "get")
            .mockRejectedValue(new Error());

            
            const sut = makeSut();
            const result = await sut.index();
            expect(result).toEqual(serverError());
        });

        test("Deveria retornar a lista de usuários", async () => {
            jest.spyOn(UserRepository.prototype, "getUsers")
            .mockResolvedValue([makeUserResult()]);

            const getSpy = jest.spyOn(CacheRepository.prototype, "get")
            .mockResolvedValue(null);

            const setSpy = jest.spyOn(CacheRepository.prototype, "set")
            .mockResolvedValue(null);

            const sut = makeSut();
            const result = await sut.index();

            expect(result).toStrictEqual(ok([makeUserResult()]))
            expect(getSpy).toHaveBeenCalledWith("users:all");
            expect(setSpy).toHaveBeenCalledWith("users:all", [makeUserResult()]);
        });

        test("Deveria retornar status 200 e a lista de usuario no cache", async () => {
            const getSpy = jest.spyOn(CacheRepository.prototype, "get")
            .mockResolvedValue([makeUserResult()]);

            const sut = makeSut();
            const result = await sut.index();

            expect(result).toEqual(
                ok([Object.assign({}, makeUserResult(), {cache: true})])
            )
        });
    });

    describe("Update", () => {
        test("Deveria retornar erro 500", async () => {
            jest
            .spyOn(CacheRepository.prototype, "del")
            .mockRejectedValue(new Error());

            
            const sut = makeSut();
            const result = await sut.update(makeRequestUpdate());
            expect(result).toEqual(serverError());
        });

        test("Deveria ediatr um usuario e retornar com stastus 200", async () => {
            const delSpy = jest.spyOn(CacheRepository.prototype, "del")
                .mockResolvedValue(true);
            
            jest.spyOn(UserRepository.prototype, "update")
                .mockResolvedValue(makeUserResult());
            
            const sut = makeSut();
            const result = await sut.update(makeRequestUpdate());

            expect(result).toStrictEqual(ok(makeUserResult()))
            expect(delSpy).toHaveBeenCalledWith("users:all");
            expect(delSpy).toHaveBeenCalledWith(`user:${makeUserResult().uid}`);
        });
    });

    describe("Delete", () => {
        test("Deveria retornar erro 500", async () => {
            jest
            .spyOn(CacheRepository.prototype, "del")
            .mockRejectedValue(new Error());

            
            const sut = makeSut();
            const result = await sut.delete(makeRequestUid());
            expect(result).toEqual(serverError());
        });

        test("Deveria excluir um usuario e retornar com stastus 200", async () => {
            const delSpy = jest.spyOn(CacheRepository.prototype, "del")
                .mockResolvedValue(true);
            
            jest.spyOn(UserRepository.prototype, "delete")
                .mockResolvedValue(makeDeleteResult())

            const sut = makeSut();
            const result = await sut.delete(makeRequestUid());

            expect(result).toStrictEqual(ok(makeDeleteResult()))
            expect(delSpy).toHaveBeenCalledWith("users:all");
            expect(delSpy).toHaveBeenCalledWith(`user:${makeUserResult().uid}`);
        });
    });
});