import { UserEntity } from "../../../../core/infra";
import { badRequest, CompareFieldsValidator, HttpMiddleware, HttpResponse, Middleware, ok, RequireFieldsValidator } from "../../../../core/presentation";
import { User } from "../../domain";
import { UserAlreadyExistsError } from "../errors";



export class UserMiddleware implements Middleware {
    async handle(request: HttpMiddleware): Promise<HttpResponse> {
        const body: User = request.body;

        const requiredFields = [
            'username',
            'password',
            'confirmPassword'
        ];

        for(const field of requiredFields) {
            const error = new RequireFieldsValidator(field).validate(body);
            if(error) return badRequest(error);
        }

        const passwordError = new CompareFieldsValidator('password', 'confirmPassword').validate(body);
        if(passwordError) return badRequest(passwordError);

        const { username } = request.body;
        const user = await UserEntity.findOne({
            where: { username },
        });

        if(user) return badRequest(new UserAlreadyExistsError());

        return ok({});
    }
    
}