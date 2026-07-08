import app from "../app";
import Database from "../database/mysqldatabase";
import ping from "ping";


export default class CheckIP{

	private db: any;
	private hosts: any = [];
	private io: any;
	private app: any;

	constructor(app: any){
		this.db = new Database();
		this.app = app; 
		this.io = this.app.get('socketio');

		this.getIPs();
	}

	getIPs(){
		this.db.query("SELECT sensor_ip, monitor_ip from nodes", (err: any, res: any) => {
			if (err) {
				console.log(err);
			}else{
				if (res.length >= 1) {

                	this.hosts = [];

	                for(var x = 0; x < res.length; x ++){

	                    this.hosts.push(res[x]['sensor_ip']);
	                    this.hosts.push(res[x]['monitor_ip']);
	       
	                }

                	console.log("IP LIST", JSON.stringify(this.hosts));

                   //var hosts = ['192.168.1.11', '192.168.1.21', '192.168.1.31', '192.168.1.12', '192.168.1.22', '192.168.1.32'];

                	this.pingIPs(this.hosts);
            	}
			}
		});
	}

	pingIPs(hosts: any){

		hosts.forEach((host: any) => {
            ping.sys.probe(host, (isAlive: any) => {
                var msg = isAlive ? 'alive' : 'connect_error';
                //
                //console.log(host+" "+msg);
                this.io.emit(host, msg);
            });
        });

		setTimeout(() => {
	        this.pingIPs(hosts);
		}, 5000);
		
	}
}