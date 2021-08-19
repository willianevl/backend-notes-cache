
import { DataNotFoundError, HttpRequest, notFound, ok, serverError } from "../../../../../src/core/presentation";
import { CacheRepository } from "../../../../../src/core/infra";
import { v4 as uuid } from 'uuid';
import { DeleteResult } from "typeorm";
import { CheckedNotesController } from "../../../../../src/features/checked-notes/presentation/controllers";
import { CheckedNotesRepository } from "../../../../../src/features/checked-notes/infra";

const makeSut = (): CheckedNotesController => new CheckedNotesController(new CheckedNotesRepository(), new CacheRepository());

const makeRequestStore = (): HttpRequest => ({
    body: {
        title: "any_title",
        description: "any_description",
    },
    params: {},
});

const makeCheckedNotesResult = () => ({
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
            jest.spyOn(CheckedNotesRepository.prototype, "create").
            mockRejectedValue(new Error());

            const sut = makeSut();
            const result = await sut.store(makeRequestStore());
            expect(result).toEqual(serverError());
        });

        test("Deveria chamar o Repositorio com valores corretos", async () => {
            const createSpy = jest.spyOn(CheckedNotesRepository.prototype, "create")
                .mockResolvedValue(makeCheckedNotesResult());

            const delSpy = jest.spyOn(CacheRepository.prototype, "del")
                .mockResolvedValue(true);

            const sut = makeSut();
            const data = makeRequestStore()
            await sut.store(data);

            expect(delSpy).toHaveBeenCalledWith("checkednotes:all");
            expect(createSpy).toHaveBeenCalledWith(makeRequestStore().body);
        });

        test("Deveria apagar o cache do redis", async () => {
            const delSpy = jest.spyOn(CacheRepository.prototype, "del")
                .mockResolvedValue(true);

            const sut = makeSut();
            const data = makeRequestStore();
            await sut.store(data);

            expect(delSpy).toHaveBeenCalledWith("checkednotes:all")
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
            
            jest.spyOn(CheckedNotesRepository.prototype, "getNote")
            .mockResolvedValue(undefined);

            const sut = makeSut();
            const result = await sut.show(makeRequestUid());

            expect(result).toEqual(notFound(new DataNotFoundError()));
        });

        test("Deveria retornar o usuario com status 200", async () => {
            const getSpy = jest.spyOn(CacheRepository.prototype, "get").mockResolvedValue(null);
            const setSpy = jest.spyOn(CacheRepository.prototype, "set").mockResolvedValue(null);

            jest.spyOn(CheckedNotesRepository.prototype, "getNote")
            .mockResolvedValue(makeCheckedNotesResult());

            const sut = makeSut();
            const result = await sut.show(makeRequestUid());

            expect(result).toEqual(ok(makeCheckedNotesResult()));
            expect(getSpy).toHaveBeenCalledWith(`checkednote:${makeCheckedNotesResult().uid}`);
            expect(setSpy).toHaveBeenCalledWith(
                `checkednote:${makeCheckedNotesResult().uid}`, makeCheckedNotesResult()
            );
        });

        test("Deveria retornar 200 se o projeto existir em cache", async () => {
            const getSpy = jest.spyOn(CacheRepository.prototype, "get")
            .mockResolvedValue(makeCheckedNotesResult());

            const sut = makeSut();
            const result = await sut.show(makeRequestUid());

            expect(result).toEqual(ok(Object.assign({}, makeCheckedNotesResult(), {cache: true})));

            expect(getSpy).toHaveBeenLastCalledWith(
                `checkednote:${makeCheckedNotesResult().uid}`
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
            jest.spyOn(CheckedNotesRepository.prototype, "getNotes")
            .mockResolvedValue([makeCheckedNotesResult()]);

            const getSpy = jest.spyOn(CacheRepository.prototype, "get")
            .mockResolvedValue(null);

            const setSpy = jest.spyOn(CacheRepository.prototype, "set")
            .mockResolvedValue(null);

            const sut = makeSut();
            const result = await sut.index(makeRequestUid());

            expect(result).toStrictEqual(ok([makeCheckedNotesResult()]))
            expect(getSpy).toHaveBeenCalledWith("checkednotes:all");
            expect(setSpy).toHaveBeenCalledWith("checkednotes:all", [makeCheckedNotesResult()]);
        });

        test("Deveria retornar status 200 e a lista de usuario no cache", async () => {
            const getSpy = jest.spyOn(CacheRepository.prototype, "get")
            .mockResolvedValue([makeCheckedNotesResult()]);

            const sut = makeSut();
            const result = await sut.index(makeRequestUid());

            expect(result).toEqual(
                ok([Object.assign({}, makeCheckedNotesResult(), {cache: true})])
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
            
            jest.spyOn(CheckedNotesRepository.prototype, "update")
                .mockResolvedValue(makeCheckedNotesResult());
            
            const sut = makeSut();
            const result = await sut.update(makeRequestUpdate());

            expect(result).toStrictEqual(ok(makeCheckedNotesResult()))
            expect(delSpy).toHaveBeenCalledWith("checkednotes:all");
            expect(delSpy).toHaveBeenCalledWith(`checkednote:${makeCheckedNotesResult().uid}`);
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
            
            jest.spyOn(CheckedNotesRepository.prototype, "delete")
                .mockResolvedValue(makeDeleteResult())

            const sut = makeSut();
            const result = await sut.delete(makeRequestUid());

            expect(result).toStrictEqual(ok(makeDeleteResult()))
            expect(delSpy).toHaveBeenCalledWith("checkednotes:all");
            expect(delSpy).toHaveBeenCalledWith(`checkednote:${makeCheckedNotesResult().uid}`);
        });
    });
});