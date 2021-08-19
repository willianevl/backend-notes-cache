import { CacheRepository } from "../../../../core/infra";
import { DataNotFoundError, HttpRequest, HttpResponse, MvcController, notFound, ok, serverError } from "../../../../core/presentation";
import { NotesRepository } from "../../infra";

export class NotesController implements MvcController {

    readonly #repository: NotesRepository;
    readonly #cache: CacheRepository;

    constructor(repository: NotesRepository, cache: CacheRepository){
        this.#repository = repository;
        this.#cache = cache;
    }

    async store(request: HttpRequest): Promise<HttpResponse> {
        try {
            const note = await this.#repository.create(request.body);

            await this.#cache.del('notes:all');

            return ok(note);
        } catch(error) {
            return serverError();
        }
    }
    
    async index(request: HttpRequest): Promise<HttpResponse> {
        const { uid } = request.params;

        try {
            const cache = await this.#cache.get('notes:all');
            if(cache){
                return ok(cache.map((notes: any) => Object.assign({}, notes, {cache: true})));
            }

            const notes = await this.#repository.getNotes(uid);

            await this.#cache.set('notes:all', notes);

            return ok(notes)
        } catch(error) {
            return serverError();
        }
    }

    async show(request: HttpRequest): Promise<HttpResponse> {
        const { uid } = request.params;

        try {
            const cache = await this.#cache.get(`note:${uid}`);
            if(cache) {
                return ok(Object.assign({}, cache, {cache: true}));
            }

            const note = await this.#repository.getNote(uid);
            if(!note) return notFound(new DataNotFoundError());

            await this.#cache.set(`note:${uid}`, note);

            return ok(note);
        } catch(error) {
            return serverError();
        }
    }

    async delete(request: HttpRequest): Promise<HttpResponse> {
        const { uid } = request.params;

        try {
            const note = await this.#repository.delete(uid);

            await this.#cache.del('notes:all');
            await this.#cache.del(`note:${uid}`);

            return ok(note);
        } catch(error) {
            return serverError();
        }
    }

    async update(request: HttpRequest): Promise<HttpResponse> {
        const { uid } = request.params;

        try {
            const note = await this.#repository.update(uid, request.body);

            await this.#cache.del('notes:all');
            await this.#cache.del(`note:${uid}`);

            return ok(note);
        } catch(error) {
            return serverError();
        }
    }
    
}