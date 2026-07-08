import app from "./app";
import config from "./config/config";

import PerminUpload from "./classes/PerminUpload";

import EventUpload from "./classes/EventUpload";

import FirstAlarmUpload from "./classes/FirstAlarmUpload";

import EventMaxUpload from "./classes/EventMaxUpload";

import Database from "./database/mysqldatabase";

const db              = new Database();


db.query("SELECT node_name, node_token from nodes", (err: any, res: any) => {
	if (err) {
		console.log(err);
	}else{
		if (res.length >= 1) {

            for(let x = 0; x < res.length; x ++){

            	new PerminUpload(res[x]['node_name'], res[x]['node_token']);

				//new EventUpload(res[x]['node_name'], res[x]['node_token']);
				new FirstAlarmUpload(res[x]['node_name'], res[x]['node_token']);

				new EventMaxUpload(res[x]['node_name'], res[x]['node_token']);
				               
            }

        	
    	}
	}

});


const io = app.get('socketio');
const server = app.get('server');

server.listen(config.PORT, () => {
	console.log("Server Running on "+config.HOST+" port "+config.PORT);
	console.log("Environment "+config.ENV+" mode");
})