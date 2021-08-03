import { NotesEntity } from "../../../../core/infra";
import { Notes } from "../../domain";


export class NotesRepository {
    async create(params: Notes): Promise<Notes> {
        const { title, description, userUid } = params;
        
        const notes = await NotesEntity.create({
            title,
            description,
            userUid
        }).save();

        return Object.assign({}, params, notes);
    }

    async getNote(uid: string): Promise<Notes | undefined> {
        const note = await NotesEntity.findOne(uid);

        if(!note) return undefined;

        return {
            uid: note.uid,
            title: note.title,
            description: note.description,
            userUid: note.userUid,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt
        } as Notes;
    }

    async getNotes(uid: string): Promise<Notes[]> {
        const notes = await NotesEntity.find({userUid: uid});

        return notes.map((note) => {
            return {
                uid: note.uid,
                title: note.title,
                description: note.description,
                userUid: note.userUid,
                createdAt: note.createdAt,
                updatedAt: note.updatedAt
            } as Notes;
        })
    }

    async update(uid: string, params: Notes): Promise<Notes> {
        const { title, description } = params;

        const note = await NotesEntity.update(uid, {
            title,
            description
        });

        return Object.assign({}, params, note);
    }

    async delete(uid: string) {
        return await NotesEntity.delete(uid);
    }
}