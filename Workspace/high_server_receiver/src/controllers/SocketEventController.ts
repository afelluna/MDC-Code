import { OnConnect, SocketController, ConnectedSocket, OnDisconnect, MessageBody, OnMessage } from "socket-controllers";

import { Request, Response, NextFunction } from "express";
import mtz from "moment-timezone";
import Database from "../database/mysqldatabase";
import logger from "../config/logger";
import ResponseHandler from "../middleware/responseHandler";
import config from "../config/config";
import app from "../app";

const fs         = require('fs');

const responseHandler = new ResponseHandler();
const date            = mtz().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');
const db              = new Database();


@SocketController()
export class SocketEventController{

  @OnConnect()
  connection(@ConnectedSocket() socket: any) {
    console.log("client connected");
  }

  @OnDisconnect()
  disconnect(@ConnectedSocket() socket: any) {
    console.log("client disconnected");
  }

  //WHEN NODE EMIT REQUEST SETTINGS
  @OnMessage("request_settings")
  request_settings(@ConnectedSocket() socket: any, @MessageBody() message: any = []) {

    console.log(message[0]+" Sensor is requesting for settings");

    this.nodeSettings(message[0]).then((res: any) => {
      let data = res[0];

      let config = {
        "xthold": data['xthold'],
        "ythold": data['ythold'],
        "zthold": data['zthold'],
        "warning": data['warning_min'],
        "warrant": data['alert_min'],
        "usep": 0,
        "tafter": data['after'],
        "tbefore": data['before'],
        "datetime": new Date()
      }

      socket.emit("fetch_settings", config);
    });
  }



  @OnMessage("request_fdasPort")
  request_fdasPort(@ConnectedSocket() socket: any, @MessageBody() message: any = []) {


       app.get('socketio').emit('fdasPort', ["connected"]);


  }


  @OnMessage("node")
  node(@ConnectedSocket() socket: any, @MessageBody() message: any = []) {

    let nodename = message[0];
    let data = message[1];
    let io = app.get('socketio');

    io.emit(nodename, data);
  }


  @OnMessage("firstalarm")
  firstalarm(@ConnectedSocket() socket: any, @MessageBody() message: any = []) {

    let firstAlarmPath = config.UPLOAD_STORAGE_DIR+message[0]+"/"+config.LOGS_FIRST_ALARM_DIR+"/"+message[1];
    console.log("firstAlarmPath");
    console.log(firstAlarmPath);
    try {
      fs.mkdir(firstAlarmPath, { recursive: true }, (err: any) => {
        if (err) throw "Error make first alarm directory"+ err;

        let timePath = this.getTimePath();

        let created_at = timePath['created_at'];

        let sql = "INSERT INTO warning_logs (node_name, event_unique_id, created_at, intensity) VALUES (?, ?, ?, ?)";

        let param = [message[0], message[1], created_at, message[1].slice(-2)];

        db.query(sql, param).then(res => {

          let io = app.get('socketio');

           let emitData = {
              "created_at": created_at,
              "node_name": param[0],
              "event_unique_id": param[1],
              "intensity": parseInt(param[3]),
            }


          io.emit("newfirstalarm", emitData);

        }).catch(err => {
          logger.info("Error Query first alarm event file "+err);
        });

      });

    }catch(err){
      logger.info("Error first alarm event file "+err);
    }

  }

  to: any;

  color: any = null;

  startWriteTO(color: string = "off"){
    this.to = setTimeout(() => {
      if (this.color) {
        console.log("LIGHT TO COLOR " +this.color);


        if (this.color == "green") {
          try {

            db.query("SELECT * FROM intensity_configs LIMIT 1", (err: any, result: any) => {
              if (err) {

              }else{
                let green_light = result[0]['green_light'];

                console.log(green_light + "FROM Database" +this.color);

                if (green_light) {

                  console.log("writeEvent color "+this.color);
                  app.get("serial").writeEvent("green");
                }

              }

            });

          } catch (err){
            // logger.info("Error fetch intensity config "+err);
            console.log("ERROR LIGHT GREEN");
          }

        }else{
            app.get("serial").writeEvent(this.color);
        }


        this.color = null;
      }else{
        console.log("ERROR NO COLOR");
      }
    }, 1000);
  }

  stopWriteTO(){
    if (this.to) {
      clearTimeout(this.to);
    }
  }

  execStopStartTO(){
    this.stopWriteTO();
    this.startWriteTO();
  }

  @OnMessage("light")
  light(@ConnectedSocket() socket: any, @MessageBody() message: any = []) {


    console.log("lighting",message);
    let color = message[0];
    let node_name = message[1];

    let io = app.get('socketio');

    io.emit(node_name+"-light", color);

    if (color == "green" && this.color !== "yellow" && this.color !== "yellowred") {
      this.color = color;
    }else if(color == "yellow" && this.color !== "yellowred" && this.color !== "yellow"){
      this.color = color;
    }else if (color == "yellowred" && this.color !== "yellowred") {
      this.color = color;
    }else if (color == "off" && this.color !== "off") {
      this.color = color;
    }

    console.log(this.color);


    this.execStopStartTO();

  }

  @OnMessage("announcement")
  announcement(@ConnectedSocket() socket: any, @MessageBody() message: any = []) {
    console.log(message);

    let color = message[0];

    let node_name = message[1];

    let io = app.get('socketio');

    io.emit(node_name+"-announcement", color);

    //rpiMod.runPA(color);
  }

  async nodeSettings(node_name: string){

    this.sql = "SELECT node_id FROM nodes WHERE node_name= ? LIMIT 1";
    this.param = [node_name];

    this.result = await db.query(this.sql, this.param);

    this.newResult = JSON.parse(JSON.stringify(this.result));

    console.log(this.newResult);

    let nodeId = this.newResult[0]["node_id"];

    this.sql = "SELECT ic.*, (SELECT positive_x_magni FROM node_profiles WHERE node_id = ? LIMIT 1) as xthold, "
                          +"(SELECT positive_y_magni FROM node_profiles WHERE node_id = ? LIMIT 1) as ythold, "
                          +"(SELECT positive_z_magni FROM node_profiles WHERE node_id = ? LIMIT 1) as zthold "
                          +" FROM intensity_configs ic LIMIT 1";

    this.param = [nodeId, nodeId, nodeId];

    return await db.query(this.sql, this.param);

  }

  public sql: string = "";
  public param: any = [];
  public result: any;
  public newResult: any;

  constructor() {
  }

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