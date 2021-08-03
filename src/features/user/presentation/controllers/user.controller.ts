import { CacheRepository } from "../../../../core/infra";
import { HttpRequest, HttpResponse, MvcController, notFound, ok, serverError } from "../../../../core/presentation";
import { UserRepository } from "../../infra";


export class UserController implements MvcController {

    readonly #repository: UserRepository;
    readonly #cache: CacheRepository;

    constructor(repository: UserRepository, cache: CacheRepository) {
        this.#repository = repository;
        this.#cache = cache;
    }

    async store(request: HttpRequest): Promise<HttpResponse> {
        try {
            const user = await this.#repository.create(request.body);

            await this.#cache.del('users:all');

            return ok(user);
        } catch(error) {

            console.log(error)
            return serverError();
        }
    }

    async index(request: HttpRequest): Promise<HttpResponse> {
        try {
            const cache = await this.#cache.get('users:all');
            if(cache) {
                return ok(cache.map((users: any) => Object.assign({}, users, { cache: true })));
            }

            const users = await this.#repository.getUsers();

            await this.#cache.set(`users:all`, users);

            return ok(users);
        } catch(error) {
            console.log(error)
            return serverError();
        }
    }

    async show(request: HttpRequest): Promise<HttpResponse> {
        const { uid } = request.params;

        try {
            const cache = await this.#cache.get(`user:${uid}`);
            if(cache){
                return ok(Object.assign({}, cache, {cache: true}));
            }

            const user = await this.#repository.getUser(uid);
            if(!user) return notFound();

            await this.#cache.set(`user:${uid}`, user);

            return ok(user);
        } catch(error){
            return serverError()
        }
    }

    async delete(request: HttpRequest): Promise<HttpResponse> {
        const { uid } = request.params;
        try {
            const user = await this.#repository.delete(uid);

            await this.#cache.del('users:all');
            await this.#cache.del(`user:${uid}`);

            return ok(user);
        } catch(error) {
            return serverError();
        }
    }

    async update(request: HttpRequest): Promise<HttpResponse> {
        const { uid } = request.params;
        try {
            const user = await this.#repository.update(uid, request.body);

            await this.#cache.del('users:all');
            await this.#cache.del(`user:${uid}`);

            return ok(user);
        } catch(error) {
            return serverError();
        }
    }
    
}