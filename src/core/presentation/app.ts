import cors from "cors";
import express, { Request, Response, Router } from "express";
import { CheckedNotesRoutes } from "../../features/checked-notes/presentation/routes/routes";
import { NotesRoutes } from "../../features/notes/presentation/routes/routes";
import { UserRoutes } from "../../features/user/presentation/routes/routes";


export default class App {
  readonly #express: express.Application;

  constructor() {
    this.#express = express();
  }

  public get server(): express.Application {
    return this.#express;
  }

  public init(): void {
    this.middlewares();
    this.routes();
  }

  private middlewares(): void {
    this.#express.use(cors());
    this.#express.use(express.json());
    this.#express.use(express.urlencoded({ extended: false }));
  }

  private routes(): void {
    const router = Router();

    this.#express.get("/", (_: Request, res: Response) => res.redirect("/api"));
    this.#express.use("/api", router);

    router.get("/", (_: Request, res: Response) => res.send("API RUNNING..."));


    const userRoutes = new UserRoutes().init(router);
    const notesRoutes = new NotesRoutes().init(router);
    const checkedNotesRoutes = new CheckedNotesRoutes().init(router);
    this.#express.use(userRoutes, notesRoutes, checkedNotesRoutes);
  }

  public start(port: number): void {
    this.#express.listen(port, () =>
      console.log(`Server is running on ${port}`)
    );
  }
}
