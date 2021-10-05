import { DeleteResult } from "typeorm";
import { DataNotFoundError, HttpRequest, HttpResponse, MvcController, notFound, ok, serverError } from "../../../../core/presentation";
import { UserRepository } from "../../infra";


export class UserController implements MvcController {

    readonly #repository: UserRepository;

    constructor(repository: UserRepository) {
        this.#repository = repository;
    }

    async store(request: HttpRequest): Promise<HttpResponse> {
        try {
            const user = await this.#repository.create(request.body);

            return ok(user);
        } catch(error) {

            console.log(error)
            return serverError();
        }
    }

    async index(): Promise<HttpResponse> {
        try {
            const users = await this.#repository.getUsers();

            return ok(users);
        } catch(error) {
            console.log(error)
            return serverError();
        }
    }

    async show(request: HttpRequest): Promise<HttpResponse> {
        const { uid } = request.params;

        try {
            const user = await this.#repository.getUser(uid);
            if(!user) return notFound(new DataNotFoundError());

            return ok(user);
        } catch(error){
            return serverError()
        }
    }

    async delete(request: HttpRequest): Promise<HttpResponse> {
        const { uid } = request.params;
        try {
            const user: DeleteResult = await this.#repository.delete(uid);

            return ok(user);
        } catch(error) {
            return serverError();
        }
    }

    async update(request: HttpRequest): Promise<HttpResponse> {
        const { uid } = request.params;
        try {
            const user = await this.#repository.update(uid, request.body);

            return ok(user);
        } catch(error) {
            return serverError();
        }
    }
    
}