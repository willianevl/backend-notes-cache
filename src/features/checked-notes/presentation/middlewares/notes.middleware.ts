import { badRequest, HttpMiddleware, HttpResponse, Middleware, ok, RequireFieldsValidator } from "../../../../core/presentation";
import { CheckedNotes } from "../../domain";


export class CheckedNotesMiddleware implements Middleware {
    async handle(request: HttpMiddleware): Promise<HttpResponse> {
        const body: CheckedNotes = request.body;

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