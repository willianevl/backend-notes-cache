import { HttpMiddleware, HttpResponse } from "../models";

export interface Middleware {
    handle(request: HttpMiddleware): Promise<HttpResponse>;
}