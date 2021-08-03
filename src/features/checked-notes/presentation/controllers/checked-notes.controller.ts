import { CacheRepository } from "../../../../core/infra";
import { HttpRequest, HttpResponse, MvcController, notFound, ok, serverError } from "../../../../core/presentation";
import { CheckedNotesRepository } from "../../infra";



export class CheckedNotesController implements MvcController {

    readonly #repository: CheckedNotesRepository;
    readonly #cache: CacheRepository;

    constructor(repository: CheckedNotesRepository, cache: CacheRepository){
        this.#repository = repository;
        this.#cache = cache;
    }

    async store(request: HttpRequest): Promise<HttpResponse> {
        try {
            const checkednote = await this.#repository.create(request.body);

            await this.#cache.del('checkednotes:all');

            return ok(checkednote);
        } catch(error) {
            return serverError();
        }
    }
    
    async index(request: HttpRequest): Promise<HttpResponse> {
        const { uid } = request.params;
        try {
            const cache = await this.#cache.get('checkednotes:all');
            if(cache) {
                return ok(cache.map((checkednotes: any) => Object.assign({}, checkednotes, {cache: true})));
            }

            const checkednotes = await this.#repository.getNotes(uid);

            await this.#cache.set('checkednotes:all', checkednotes)

            return ok(checkednotes)
        } catch(error) {
            return serverError();
        }
    }

    async show(request: HttpRequest): Promise<HttpResponse> {
        const { uid } = request.params;

        try {
            const cache = await this.#cache.get(`checkednote:${uid}`);
            if(cache) {
                return ok(Object.assign({}, cache, {cache: true}));
            }

            const checkednote = await this.#repository.getNote(uid);
            if(!checkednote) return notFound();

            await this.#cache.set(`checkednote:${uid}`, checkednote)

            return ok(checkednote);
        } catch(error) {
            return serverError();
        }
    }

    async delete(request: HttpRequest): Promise<HttpResponse> {
        const { uid } = request.params;

        try {
            const checkednote = await this.#repository.delete(uid);

            await this.#cache.del('checkednotes:all');
            await this.#cache.del(`checkednote:${uid}`);

            return ok(checkednote);
        } catch(error) {
            return serverError();
        }
    }

    async update(request: HttpRequest): Promise<HttpResponse> {
        const { uid } = request.params;

        try {
            const checkednote = await this.#repository.update(uid, request.body);

            await this.#cache.del('checkednotes:all');
            await this.#cache.del(`checkednote:${uid}`);

            return ok(checkednote);
        } catch(error) {
            return serverError();
        }
    }
    
}