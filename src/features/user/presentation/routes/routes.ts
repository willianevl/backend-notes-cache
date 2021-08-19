import { Router } from "express";
import { CacheRepository } from "../../../../core/infra";
import { EMvc, middlewareAdapter, MvcController, routerMvcAdapter } from "../../../../core/presentation";
import { UserRepository } from "../../infra";
import { UserController } from "../controllers";
import { UserMiddleware } from "../middlewares";



const makeController = (): MvcController => {
    const repository = new UserRepository();
    const cache = new CacheRepository();
    return new UserController(repository, cache);
}

export class UserRoutes {
    public init(routes: Router): Router {

        routes.post("/user", middlewareAdapter(new UserMiddleware()),
        routerMvcAdapter(makeController(), EMvc.STORE));

        routes.get('/user', routerMvcAdapter(makeController(), EMvc.INDEX));

        routes.get('/user/:uid', routerMvcAdapter(makeController(), EMvc.SHOW));

        routes.put('/user/:uid', middlewareAdapter(new UserMiddleware()),
        routerMvcAdapter(makeController(), EMvc.UPDATE));
        
        routes.delete('/user/:uid', routerMvcAdapter(makeController(), EMvc.DELETE));

        return routes;
    }
}