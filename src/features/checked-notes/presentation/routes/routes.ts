import { Router } from "express";
import { CacheRepository } from "../../../../core/infra";
import { EMvc, middlewareAdapter, MvcController, routerMvcAdapter } from "../../../../core/presentation";
import { CheckedNotesRepository } from "../../infra";
import { CheckedNotesController } from "../controllers";
import { CheckedNotesMiddleware } from "../middlewares";


const makeController = (): MvcController => {
    const repository = new CheckedNotesRepository();
    const cache = new CacheRepository();
    return new CheckedNotesController(repository, cache);
}

export class CheckedNotesRoutes {
    public init(): Router {
        const routes = Router();

        routes.post('/checkednotes', middlewareAdapter(new CheckedNotesMiddleware()), 
        routerMvcAdapter(makeController(), EMvc.STORE));
        routes.get('/checkednotes/user/:uid', routerMvcAdapter(makeController(), EMvc.INDEX));
        routes.get('/checkednotes/:uid', routerMvcAdapter(makeController(), EMvc.SHOW));
        routes.put('/checkednotes/:uid', middlewareAdapter(new CheckedNotesMiddleware()),
        routerMvcAdapter(makeController(), EMvc.UPDATE));
        routes.delete('/checkednotes/:uid', routerMvcAdapter(makeController(), EMvc.DELETE));

        return routes;
    }
}