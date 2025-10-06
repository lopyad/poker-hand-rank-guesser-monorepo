import 'dotenv/config';
import { startServer } from './server';
import { Controller } from "./controller/controller";
import { AuthService } from "./service/auth.service";
import { Repository } from "./repository/repository";
import { Service } from "./service/service";
import { GameService } from "./service/game.service";

const repository = new Repository();
const authService = new AuthService(repository);
const generalService = new Service(repository);
const gameService = new GameService(repository);
const controller = new Controller(authService, generalService, gameService);

startServer(controller);
