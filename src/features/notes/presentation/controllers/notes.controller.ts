import { DataNotFoundError, HttpRequest, HttpResponse, MvcController, notFound, ok, serverError } from "../../../../core/presentation";
import { NotesRepository } from "../../infra";

export class NotesController implements MvcController {

    readonly #repository: NotesRepository;

    constructor(repository: NotesRepository){
        this.#repository = repository;
    }

    async store(request: HttpRequest): Promise<HttpResponse> {
        try {
            const note = await this.#repository.create(request.body);

            return ok(note);
        } catch(error) {
            return serverError();
        }
    }
    
    async index(request: HttpRequest): Promise<HttpResponse> {
        try {
            const notes = await this.#repository.getNotes();

            return ok(notes)
        } catch(error) {
            return serverError();
        }
    }

    async show(request: HttpRequest): Promise<HttpResponse> {
        const { uid } = request.params;

        try {
            const note = await this.#repository.getNote(uid);
            if(!note) return notFound(new DataNotFoundError());

            return ok(note);
        } catch(error) {
            return serverError();
        }
    }

    async delete(request: HttpRequest): Promise<HttpResponse> {
        const { uid } = request.params;

        try {
            const note = await this.#repository.delete(uid);

            return ok(note);
        } catch(error) {
            return serverError();
        }
    }

    async update(request: HttpRequest): Promise<HttpResponse> {
        const { uid } = request.params;

        try {
            const note = await this.#repository.update(uid, request.body);

            return ok(note);
        } catch(error) {
            return serverError();
        }
    }
    
}