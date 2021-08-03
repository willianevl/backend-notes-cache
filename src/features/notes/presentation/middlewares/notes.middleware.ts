import { badRequest, HttpMiddleware, HttpResponse, Middleware, ok, RequireFieldsValidator } from "../../../../core/presentation";
import { Notes } from "../../domain";

export class NotesMiddleware implements Middleware {
    async handle(request: HttpMiddleware): Promise<HttpResponse> {
        const body: Notes = request.body;

        const requiredFields = [
            'title',
            'description',
            'userUid'
        ];

        for(const field of requiredFields){
            const error = new RequireFieldsValidator(field).validate(body);
            if(error) return badRequest(error);
        }

        return ok({});
    }
    
}