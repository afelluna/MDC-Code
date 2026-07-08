import logger from "../config/logger";
import config from "../config/config";

var os = require('os');

let Gpio: any;  
let OMXPlayer: any;
let linuxPlat = false;


if (os.platform() !== "win32") {
	linuxPlat = true;
	
	OMXPlayer = require('node-omxplayer');
}

console.log("Platform: " + os.platform());
console.log("Architecture: " + os.arch());

//
export default class RpiModule{

	buzz:  any;
	green: any;
	yellow:  any;
	red: any;
	buttOne: any;
	buttTwo: any;

	player: any;    

	constructor(){

		if (linuxPlat) {
		

			this.player = OMXPlayer();

		}
	
	}

	test(){
		setTimeout(() => {
				this.player.newSource("assets/pa-green.mp3", 'both', false, 0, true);

				setTimeout(() => {
					this.player.quit();
					this.test();
				}, 5000)


			}, 7000);
	}

	runPA(data: string){
		if (data) {
			let source = "";

			if (data == "green") {
				source = "pa-green.mp3";	
			}else if(data == "yellow"){
		      	source = "pa-yellow.mp3";
		    }else if(data == "yellowred"){
		      	source = "pa-red.mp3";
		    }

		    if (this.player.running) {
		    	this.player.quit();
		    }

		    this.player = null;

		    this.player = OMXPlayer('assets/'+source, 'both', false, 0, true);

		}

		console.log(data);
	}
}