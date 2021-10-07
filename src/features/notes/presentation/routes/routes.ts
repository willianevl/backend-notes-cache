import { Router } from "express";
import { EMvc, middlewareAdapter, MvcController, routerMvcAdapter } from "../../../../core/presentation";
import { NotesRepository } from "../../infra/repositories/notes.repository";
import { NotesController } from "../controllers/notes.controller";
import { NotesMiddleware } from "../middlewares/notes.middleware";

const makeController = (): MvcController => {
    const repository = new NotesRepository();
    return new NotesController(repository);
}

export class NotesRoutes {
    public init(routes: Router): Router {

        routes.post('/notes', middlewareAdapter(new NotesMiddleware()), 
        routerMvcAdapter(makeController(), EMvc.STORE));
        
        routes.get('/notes', routerMvcAdapter(makeController(), EMvc.INDEX));
        routes.get('/notes/:uid', routerMvcAdapter(makeController(), EMvc.SHOW));
        routes.put('/notes/:uid', middlewareAdapter(new NotesMiddleware()),
        routerMvcAdapter(makeController(), EMvc.UPDATE));
        routes.delete('/notes/:uid', routerMvcAdapter(makeController(), EMvc.DELETE));


        return routes;
    }
}