
import { DataNotFoundError, HttpRequest, notFound, ok, serverError } from "../../../../../src/core/presentation";
import { CacheRepository } from "../../../../../src/core/infra";
import { v4 as uuid } from 'uuid';
import { DeleteResult } from "typeorm";
import { NotesController } from "../../../../../src/features/notes/presentation/controllers";
import { NotesRepository } from "../../../../../src/features/notes/infra";

const makeSut = (): NotesController => new NotesController(new NotesRepository(), new CacheRepository());

const makeRequestStore = (): HttpRequest => ({
    body: {
        title: "any_title",
        description: "any_description",
    },
    params: {},
});

const makeNotesResult = () => ({
    uid: "any_uid",
    title: "any_title",
    description: "any_description",
    userUid: "any_useruid"
});

const makeRequestUid = (): HttpRequest => ({
    params: { uid: "any_uid" },
    body: {},
});

const makeRequestUpdate = (): HttpRequest => ({
    body: {
        title: "any_title",
        description: "any_description"
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
            jest.spyOn(NotesRepository.prototype, "create").
            mockRejectedValue(new Error());

            const sut = makeSut();
            const result = await sut.store(makeRequestStore());
            expect(result).toEqual(serverError());
        });

        test("Deveria chamar o Repositorio com valores corretos", async () => {
            const createSpy = jest.spyOn(NotesRepository.prototype, "create")
                .mockResolvedValue(makeNotesResult());

            const delSpy = jest.spyOn(CacheRepository.prototype, "del")
                .mockResolvedValue(true);

            const sut = makeSut();
            const data = makeRequestStore()
            await sut.store(data);

            expect(delSpy).toHaveBeenCalledWith("notes:all");
            expect(createSpy).toHaveBeenCalledWith(makeRequestStore().body);
        });

        test("Deveria apagar o cache do redis", async () => {
            const delSpy = jest.spyOn(CacheRepository.prototype, "del")
                .mockResolvedValue(true);

            const sut = makeSut();
            const data = makeRequestStore();
            await sut.store(data);

            expect(delSpy).toHaveBeenCalledWith("notes:all")
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
            
            jest.spyOn(NotesRepository.prototype, "getNote")
            .mockResolvedValue(undefined);

            const sut = makeSut();
            const result = await sut.show(makeRequestUid());

            expect(result).toEqual(notFound(new DataNotFoundError()));
        });

        test("Deveria retornar o usuario com status 200", async () => {
            const getSpy = jest.spyOn(CacheRepository.prototype, "get").mockResolvedValue(null);
            const setSpy = jest.spyOn(CacheRepository.prototype, "set").mockResolvedValue(null);

            jest.spyOn(NotesRepository.prototype, "getNote")
            .mockResolvedValue(makeNotesResult());

            const sut = makeSut();
            const result = await sut.show(makeRequestUid());

            expect(result).toEqual(ok(makeNotesResult()));
            expect(getSpy).toHaveBeenCalledWith(`note:${makeNotesResult().uid}`)
            expect(setSpy).toHaveBeenCalledWith(
                `note:${makeNotesResult().uid}`, makeNotesResult()
            );
        });

        test("Deveria retornar 200 se o projeto existir em cache", async () => {
            const getSpy = jest.spyOn(CacheRepository.prototype, "get")
            .mockResolvedValue(makeNotesResult());

            const sut = makeSut();
            const result = await sut.show(makeRequestUid());

            expect(result).toEqual(ok(Object.assign({}, makeNotesResult(), {cache: true})));

            expect(getSpy).toHaveBeenLastCalledWith(
                `note:${makeNotesResult().uid}`
              );
        });
    });

    describe("Index", () => {
        test("Deveria retornar erro 500", async () => {
            jest
            .spyOn(CacheRepository.prototype, "get")
            .mockRejectedValue(new Error());

            
            const sut = makeSut();
            const result = await sut.index(makeRequestUid());
            expect(result).toEqual(serverError());
        });

        test("Deveria retornar a lista de usuários", async () => {
            jest.spyOn(NotesRepository.prototype, "getNotes")
            .mockResolvedValue([makeNotesResult()]);

            const getSpy = jest.spyOn(CacheRepository.prototype, "get")
            .mockResolvedValue(null);

            const setSpy = jest.spyOn(CacheRepository.prototype, "set")
            .mockResolvedValue(null);

            const sut = makeSut();
            const result = await sut.index(makeRequestUid());

            expect(result).toStrictEqual(ok([makeNotesResult()]))
            expect(getSpy).toHaveBeenCalledWith("notes:all");
            expect(setSpy).toHaveBeenCalledWith("notes:all", [makeNotesResult()]);
        });

        test("Deveria retornar status 200 e a lista de usuario no cache", async () => {
            const getSpy = jest.spyOn(CacheRepository.prototype, "get")
            .mockResolvedValue([makeNotesResult()]);

            const sut = makeSut();
            const result = await sut.index(makeRequestUid());

            expect(result).toEqual(
                ok([Object.assign({}, makeNotesResult(), {cache: true})])
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
            
            jest.spyOn(NotesRepository.prototype, "update")
                .mockResolvedValue(makeNotesResult());
            
            const sut = makeSut();
            const result = await sut.update(makeRequestUpdate());

            expect(result).toStrictEqual(ok(makeNotesResult()))
            expect(delSpy).toHaveBeenCalledWith("notes:all");
            expect(delSpy).toHaveBeenCalledWith(`note:${makeNotesResult().uid}`);
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
            
            jest.spyOn(NotesRepository.prototype, "delete")
                .mockResolvedValue(makeDeleteResult())

            const sut = makeSut();
            const result = await sut.delete(makeRequestUid());

            expect(result).toStrictEqual(ok(makeDeleteResult()))
            expect(delSpy).toHaveBeenCalledWith("notes:all");
            expect(delSpy).toHaveBeenCalledWith(`note:${makeNotesResult().uid}`);
        });
    });
});