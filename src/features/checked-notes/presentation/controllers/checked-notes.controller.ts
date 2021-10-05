import { DataNotFoundError, HttpRequest, HttpResponse, MvcController, notFound, ok, serverError } from "../../../../core/presentation";
import { CheckedNotesRepository } from "../../infra";



export class CheckedNotesController implements MvcController {

    readonly #repository: CheckedNotesRepository;

    constructor(repository: CheckedNotesRepository){
        this.#repository = repository;
    }

    async store(request: HttpRequest): Promise<HttpResponse> {
        try {
            const checkednote = await this.#repository.create(request.body);

            return ok(checkednote);
        } catch(error) {
            return serverError();
        }
    }
    
    async index(request: HttpRequest): Promise<HttpResponse> {
        const { uid } = request.params;
        try {
            const checkednotes = await this.#repository.getNotes(uid);

            return ok(checkednotes)
        } catch(error) {
            return serverError();
        }
    }

    async show(request: HttpRequest): Promise<HttpResponse> {
        const { uid } = request.params;

        try {
            const checkednote = await this.#repository.getNote(uid);
            if(!checkednote) return notFound(new DataNotFoundError());

            return ok(checkednote);
        } catch(error) {
            return serverError();
        }
    }

    async delete(request: HttpRequest): Promise<HttpResponse> {
        const { uid } = request.params;

        try {
            const checkednote = await this.#repository.delete(uid);

            return ok(checkednote);
        } catch(error) {
            return serverError();
        }
    }

    async update(request: HttpRequest): Promise<HttpResponse> {
        const { uid } = request.params;

        try {
            const checkednote = await this.#repository.update(uid, request.body);

            return ok(checkednote);
        } catch(error) {
            return serverError();
        }
    }
    
}