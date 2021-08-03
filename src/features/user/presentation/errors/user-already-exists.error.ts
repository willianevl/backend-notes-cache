export class UserAlreadyExistsError extends Error {
    constructor(){
        super("User already exists with these data");
        this.name = 'UserAlreadyExistsError';
    }
}