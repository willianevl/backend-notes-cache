import { Router } from "express";
import { EMvc, middlewareAdapter, MvcController, routerMvcAdapter } from "../../../../core/presentation";
import { CheckedNotesRepository } from "../../infra";
import { CheckedNotesController } from "../controllers";
import { CheckedNotesMiddleware } from "../middlewares";


const makeController = (): MvcController => {
    const repository = new CheckedNotesRepository();
    return new CheckedNotesController(repository);
}

export class CheckedNotesRoutes {
    public init(routes: Router): Router {

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