import app from "../app";
import config from "../config/config";
import Database from "../database/mysqldatabase";

const chokidar = require('chokidar');
const db              = new Database();

var os = require('os');
const fs  = require('fs');

let Gpio: any;  
let OMXPlayer: any;
let linuxPlat = false;


if (os.platform() !== "win32") {
	linuxPlat = true;
}


export default class WatchFileDir{

	private io: any;
	private app: any;
	private sql: string;
	private param: any = [];


	constructor(app: any){
		this.app = app; 
		this.io = this.app.get('socketio');
		this.listDirToWatch();
		this.sql = "";		
	}

	listDirToWatch(){

		let basePath = config.UPLOAD_STORAGE_DIR;

		let paths = [config.LOGS_EVENT_DIR, config.LOGS_FIRST_ALARM_DIR, config.LOGS_UPLOADED_EVENT_DIR];

		
		let usher01Dir = basePath+"usher01/"+paths[0];
		let usher02Dir = basePath+"usher02/"+paths[0];
		let usher03Dir = basePath+"usher03/"+paths[0];

		fs.mkdir(usher01Dir, { recursive: true }, (err: any) => { 
	  		if (err) { 
	  			console.log("Cant create dir "+usher01Dir)	
			}else{
				//this.watchDir(usher01Dir, basePath, "usher01");
	  		}		
	  	});

	  	fs.mkdir(usher02Dir, { recursive: true }, (err: any) => { 
	  		if (err) { 
	  			console.log("Cant create dir "+usher01Dir)	
			}else{
				//this.watchDir(usher02Dir, basePath, "usher02");
	  		}		
	  	});

	  	fs.mkdir(usher03Dir, { recursive: true }, (err: any) => { 
	  		if (err) { 
	  			console.log("Cant create dir "+usher01Dir)	
			}else{
				//this.watchDir(usher03Dir, basePath, "usher03");
	  		}		
	  	});

	}

	watchDir(pathDirToWatch: string, basePath: string, node_name: string){

		const watcher = chokidar.watch(pathDirToWatch, {
			  //ignored: /(^|[\/\\])\../, // ignore dotfiles
			  persistent: true,
			  ignoreInitial: true,
		});

		const log = console.log.bind(console);
	
		watcher
		  .on('addDir', (path: any) => {

		  	console.log("addDir "+path);

		  	//this.updateWarnTable("addDir", path, basePath,node_name, config.LOGS_EVENT_DIR );


		  	log(`Directory ${path} has been added`);
		  })
		  .on('unlinkDir', (path: any) => {
		  	console.log("unlinkDir "+path);

		  	//this.updateWarnTable("unlinkDir", path, basePath,node_name, config.LOGS_UPLOADED_EVENT_DIR );
		  	
		  	log(`Directory ${path} has been remove`);
		  })
		  .on('error', (error: any) => log(`Watcher error: ${error}`))
		  .on('ready', () => log("Initial "+pathDirToWatch+" scan complete. Ready for changes"))
		  .on('raw', (event: any, path: any, details: any) => { // internal
		    //log('Raw event info:', event, path, details);
		  });


		watcher.on('change', (path: any, stats: any) => {
		  if (stats) console.log(`File ${path} changed size to ${stats.size}`);
		});

	}
	
	
	// updateWarnTable(state: string, path: string, basePath: string, node_name: string, folder: string){

	// 	let pathDir = path.replace(/\\/g, '/');

	// 	var res; 
	// 	let slash;

	// 	if (linuxPlat) {
	// 		res = path.split("/");
	// 	}else{
	// 		res = path.split("\\");
	// 	}

	// 	let event_unique_id = res[res.length - 1];

	// 	// basePath = basePath.slice(0, -1);

	// 	pathDir = basePath+node_name+"/"+folder+"/"+event_unique_id;

	// 	console.log("Final path "+pathDir);

	// 	this.sql = "SELECT * FROM warning_logs WHERE node_name = ? AND event_unique_id = ?";

 //    	this.param = [node_name, event_unique_id];

 //    	db.query(this.sql, this.param).then((res: any) => {

 //            if (res.length >= 1) {
 //            	//UPDATE

	// 			this.sql = "UPDATE warning_logs SET path = ? WHERE node_name = ? AND event_unique_id = ?";

	// 	    	this.param = [pathDir, node_name, event_unique_id];

	// 	        db.query(this.sql, this.param).then(res => {
	// 	            console.log("Update successfuly ", res);

	// 	            this.io.emit("dir_modified", "yes");
	// 	        });

 //            }else{
 //            	//INSERT
 //            	let timePath = this.getTimePath();

	// 	        let created_at = timePath['created_at'];
		        
	// 	        this.sql = "INSERT INTO warning_logs (node_name, event_unique_id, created_at, path) VALUES (?, ?, ?, ?)";

	// 	        this.param = [node_name, event_unique_id, created_at, pathDir];

	// 	        db.query(this.sql, this.param).then(res => {
	// 	            console.log("Update successfuly ", res);

	// 	            this.io.emit("dir_modified", "yes");
	// 	        });
 //            }

 //        }).catch(err => {
 //        	console.log("ERROR SELECT warning_logs ", err);
 //        });

	// }

	public getTimePath(){
	    let date = new Date(); // FILE NAME CONSIST OF PARSEINTO INT get only 13 digits

	    let year   = date.getFullYear();
	    let month  = date.getMonth()+1;
	    let days   = this.addZero(date.getDate());
	    //let hours  = "h"+date.getHours();
	    //let hours  = getHoursWithZero(date);
	    let hours  = this.addZero(date.getHours());

	    let min    = this.addZero(date.getMinutes());
	    let sec    = this.addZero(date.getSeconds());

	    return {
	        created_at: year +"-"+month+"-"+days+" "+hours+":"+min+":"+sec,
	        timePath: year+"/"+month+"/"+days+"/"+hours+"/",
	        year: year,
	        month: month,
	        days: days,
	        hours: hours,
	        min: min,
	        sec: sec
	    };
	  }

	  public addZero(i: any) {
	    if (i < 10) {
	        i = "0" + i;
	    }
	    return i;
	  }
}