import app from "../app";
import logger from "../config/logger";
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline')
const Delimiter = require('@serialport/parser-delimiter')

const parser = new Readline();


var os = require('os');

let linuxPlat = false;


if (os.platform() !== "win32") {
	linuxPlat = true;

}

const player = require('node-wav-player');


export default class Serial{

	com: any;
	path: string;
	boudRate: number;
	data: any;

	player: any;


	constructor(path: string, boudRate: number){
		this.path = path;
		this.boudRate = boudRate;

		setTimeout(() => {
			if (os.platform() !== "win32") {
				this.com = this.initSerial();

			}else{
				this.com = this.initSerial();
			}

			this.player = player;
		}, 5000);

	}

	fdasTimeoutVal: any;
	//VALUE = connecting or connected
	startFdasTimeout(value: string) {
		this.fdasTimeoutVal = setTimeout(() => {

			app.get('socketio').emit('fdasPort', [value]);

			this.startFdasTimeout(value);

		} , 5000);
	}

	stoptFdasInterval() {
		if (this.fdasTimeoutVal) {
			clearTimeout(this.fdasTimeoutVal);
		}
	}

	initSerial(){

		console.log(this.path);

		let com = new SerialPort(this.path, {
		  	baudRate: this.boudRate
		});

		const parser = com.pipe(new Readline({ delimiter: '\r\n' }));

		parser.on('data', (data: any) => {
			//console.log(data);
		});

		com.on("open", (err: any) => {
	        console.log("Port opened ");
	        this.stoptFdasInterval();
			this.startFdasTimeout("connected");

			//this.stressTest();
	    });

	    com.on('error', (err: any) => {
	        console.log("Port error", err);
	        this.stoptFdasInterval();
			this.startFdasTimeout("connecting...");

			setTimeout(() => {
				this.initSerial();
			}, 10000);

	    });

	    com.on('close', (err: any) => {
	        console.log("Port close", err);

	        this.stoptFdasInterval();
			this.startFdasTimeout("connecting...");

	        setTimeout(() => {
				this.initSerial();
			}, 10000);
	    });

		return com;
	}

	intervalTest: number = 1000;

 	stressTest(){

   		// console.log("start test");
   		setTimeout(() => {
			this.com.write("green\n");
			//console.log("green");

			setTimeout(() => {
				this.com.write("off\n");
			//console.log("green");

				this.stressTest();

			}, this.intervalTest)


		}, this.intervalTest)

   	}

   	writeEvent(value: any){

   		if (this.com) {

   			console.log("WRITE "+value);
   			this.com.write(value+"\n");

   			this.runPA(value);
   		}else{
   			console.log("CANT WRITE");
   		}

	}


	paPlaying: boolean = false;

	runPA(data: string){
		if (data) {
			let source = "";

			if (data == "green") {
				source = "pa-green.wav";
			}else if(data == "yellow"){
		      	source = "pa-yellow.wav";
		    }else if(data == "yellowred"){
		      	source = "pa-red.wav";
		    }



		    if (this.paPlaying) {
		    	this.player.stop();

		    	if (source !== "") {
		    		this.playPa(source);
		    	}


		    }else{

		    	if (source !== "") {
		    		this.playPa(source);
		    		this.paPlaying = true;
		    	}


		    }
		}

		console.log(data);
	}

	playPa(source: string){
		this.player.play({
		  path: 'assets/'+source,
		  sync: true
		}).then(() => {
		  console.log('The wav file was played through.');

		  this.paPlaying = false;
		}).catch((error:any) => {
		  console.error(error);
		});
	}

}