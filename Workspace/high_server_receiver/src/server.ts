import app from "./app";
import config from "./config/config";

import { useSocketServer } from "socket-controllers";

import { SocketEventController } from "./controllers/SocketEventController";	

import WatchFileDir from "./classes/WatchFileDir";
import CheckIP from "./classes/CheckIP";


let checkIP = new CheckIP(app);
let watchDir = new WatchFileDir(app);


const io = app.get('socketio');
const server = app.get('server');

server.listen(config.PORT, () => {
	console.log("Server Running on "+config.HOST+" port "+config.PORT);
	console.log("Environment "+config.ENV+" mode");
})

useSocketServer(io, {
    controllers: [SocketEventController]
});