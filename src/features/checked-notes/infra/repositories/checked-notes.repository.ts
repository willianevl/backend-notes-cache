import { CheckedNotesEntity } from "../../../../core/infra";
import { CheckedNotes } from "../../domain";


export class CheckedNotesRepository {
    async create(params: CheckedNotes): Promise<CheckedNotes> {
        const { title, description, userUid } = params;
        
        const notes = await CheckedNotesEntity.create({
            title,
            description,
            userUid
        }).save();

        return Object.assign({}, params, notes);
    }

    async getNote(uid: string): Promise<CheckedNotes | undefined> {
        const note = await CheckedNotesEntity.findOne(uid);

        if(!note) return undefined;

        return {
            uid: note.uid,
            title: note.title,
            description: note.description,
            userUid: note.userUid,
            createdAt: note.createdAt
        } as CheckedNotes;
    }

    async getNotes(uid: string): Promise<CheckedNotes[]> {
        const notes = await CheckedNotesEntity.find({userUid: uid});

        return notes.map((note) => {
            return {
                uid: note.uid,
                title: note.title,
                description: note.description,
                userUid: note.userUid,
                createdAt: note.createdAt,
            } as CheckedNotes;
        })
    }

    async update(uid: string, params: CheckedNotes): Promise<CheckedNotes> {
        const { title, description } = params;

        const note = await CheckedNotesEntity.update(uid, {
            title,
            description
        });

        return Object.assign({}, params, note);
    }

    async delete(uid: string) {
        return await CheckedNotesEntity.delete(uid);
    }
}