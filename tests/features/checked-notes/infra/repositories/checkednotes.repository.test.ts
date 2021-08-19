import { CheckedNotesEntity, UserEntity } from '../../../../../src/core/infra';
import Database from '../../../../../src/core/infra/data/connections/database';
import { v4 as uuid } from 'uuid';
import { Notes } from '../../../../../src/features/notes/domain';
import { NotesRepository } from '../../../../../src/features/notes/infra';
import { CheckedNotes } from '../../../../../src/features/checked-notes/domain';
import { CheckedNotesRepository } from '../../../../../src/features/checked-notes/infra';

const makeCreateParams = async (): Promise<CheckedNotes> => {
    const user = await makeUserDB();

    return {
        title: "any_title",
        description: "any_description",
        userUid: user.uid
    };
};

const makeNotesDB = async (): Promise<CheckedNotesEntity[]> => {
    const user = await makeUserDB();

    const noteA = await CheckedNotesEntity.create({
        title: "any_title",
        description: "any_description",
        userUid: user.uid
    }).save();

    const noteB = await CheckedNotesEntity.create({
        title: "any_title",
        description: "any_description",
        userUid: user.uid
    }).save();

    return [noteA, noteB];
};

const makeUserDB = async (): Promise<UserEntity> => {
    return await UserEntity.create({
        username: "any_usernameA",
        password: "any_password"
    }).save();
};

const makeNoteDB = async (): Promise<CheckedNotesEntity> => {
    const user = await makeUserDB();

    return await CheckedNotesEntity.create({
        title: "any_title",
        description: "any_description",
        userUid: user.uid
    }).save();
}

const makeUpdateParams = async (): Promise<CheckedNotes> => {
    return {
        title: "any_title",
        description: "any_description",
    };
};

describe("Notes Repository", () => {
    beforeAll(async () => {
        await new Database().openConnection();
    });

    beforeEach(async () => {
        await UserEntity.clear();
        await CheckedNotesEntity.clear();
    });

    afterAll(async () => {
        await new Database().disconnectDatabase();
    });

    describe("create", () => {
        test("Deveria retornar um recado quando obtiver sucesso", async () => {
          const sut = new CheckedNotesRepository();
          const params = await makeCreateParams();
          const result = await sut.create(params);
    
          expect(result).toBeTruthy();
          expect(result.uid).toBeTruthy();
          expect(result.title).toBe("any_title");
          expect(result.userUid).toBe(params.userUid);
        });
    });

    describe("Get Notes", () => {
        test("Deveria retornar uma lista de recados", async () => {
            const sut = new CheckedNotesRepository();
            const notes = await makeNotesDB();
            const result = await sut.getNotes(notes[0].userUid);

            expect(result).toBeTruthy();
            expect(result.length).toBe(notes.length);
        });
    });

    describe("Get Note", () => {
        test("Deveria retornar undefined quando o UID for inexistente", async () => {
            const sut = new CheckedNotesRepository();
            const result = await sut.getNote(uuid());

            expect(result).toBeFalsy();
        });

        test("Deveria retornar um recado quando obtiver um UID válido", async () => {
            const sut = new CheckedNotesRepository();
            const note = await makeNoteDB();

            const result = await sut.getNote(note.uid);

            expect(result).toBeTruthy();
            expect(result?.uid).toBe(note.uid);
            expect(result?.description).toBe(note.description);
            expect(result?.title).toBe(note.title);
            expect(result?.createdAt).toStrictEqual(note.createdAt);
        });
    });

    describe("Update", () => {
        test("Deveria att um recado para um UID válido", async () => {
          const sut = new CheckedNotesRepository();
          const note = await makeNoteDB();
          const params = await makeUpdateParams();
    
          const result = await sut.update(note.uid, params);
    
          expect(result).toBeTruthy();
        });
    });

    describe("Delete", () => {
        test("Deveria excluir um usuário caso uid seja válido", async () => {
            const sut = new CheckedNotesRepository();
            const note = await makeNoteDB();

            const result = await sut.delete(note.uid);

            expect(result).toBeTruthy();
        });
    });
});