import { Request, Response, NextFunction } from "express";
import mtz from "moment-timezone";
import Database from "../database/mysqldatabase";
import logger from "../config/logger";
import ResponseHandler from "../middleware/responseHandler";
import config from "../config/config";
import fsExtra from "fs-extra";
import app from "../app";

//const fsExtra     = require('fs-extra'); //FOR MOVING FILES
import path from "path";

const lineByLine = require('n-readlines');
const fs = require('fs');
const responseHandler = new ResponseHandler();
const date = mtz().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');
const db = new Database();

export class UploadController {


  constructor() {

  }

  public getTimePath() {
    let date = new Date(); // FILE NAME CONSIST OF PARSEINTO INT get only 13 digits

    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let days = this.addZero(date.getDate());
    //let hours  = "h"+date.getHours();
    //let hours  = getHoursWithZero(date);
    let hours = this.addZero(date.getHours());

    let min = this.addZero(date.getMinutes());
    let sec = this.addZero(date.getSeconds());

    return {
      created_at: year + "-" + month + "-" + days + " " + hours + ":" + min + ":" + sec,
      timePath: year + "/" + month + "/" + days + "/" + hours + "/",
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


  loopFileContentExpress(content: any) {
    return new Promise((res, rej) => {
      let contentarray = [];

      for (let x = 0; x < content.length; x++) {
        let data = content[x].trim().split(',');

        contentarray.push(data);
      }

      res(contentarray);

    })
  }

  public async upload(req: any, res: Response, next: NextFunction) {

    try {

      if (!req.files) responseHandler.sendResponse(res, "No file uploaded", 200, true);

      const { node_name } = req.body;

      let file = req.files?.file;

      if (file !== undefined) {
        let ip = req.ip;

        let content = file.data.toString('utf8').trim().split("\n");

        this.loopFileContentExpress(content).then(result => {
          // get the io object ref
          const io = req.app.get('socketio');

          io.emit(node_name, JSON.stringify(result));

        });

        let timePath = this.getTimePath();

        let created_at = timePath['created_at'];

        let filepath = config.UPLOAD_STORAGE_DIR + node_name + "/" + config.LOGS_DIR + "/" + timePath['timePath'];

        // fs.mkdir(filepath, { recursive: true }, (err: any) => {
        //   if (err) {
        //     logger.debug('ERROR cant create uploadedDir '+filepath+""+ err);
        //     responseHandler.sendResponse(res, "File upload failed "+err, 200, true);

        //   }else{

        //     // file.mv(filepath+file.name, (err: any) => {

        //     //   if (err) {
        //     //     responseHandler.sendResponse(res, "File upload failed "+err, 200, true);
        //     //   }else{
        //     //     responseHandler.sendResponse(res, "File upload success", 200, false);
        //     //   }

        //     // })


        //   }
        // });

        responseHandler.sendResponse(res, "File upload success", 200, false);

      } else {
        responseHandler.sendResponse(res, "File is undefined upload failed ", 200, true);
      }

    } catch (err) {
      logger.info("Error upload file " + err);
      next(err)
    }
  }

  public async uploadPermin(req: any, res: Response, next: NextFunction) {

    try {

      if (!req.files) responseHandler.sendResponse(res, "No file permin uploaded", 200, true);

      const { node_name } = req.body;

      let file = req.files?.file;

      if (file !== undefined) {
        let ip = req.ip;

        let filepath = config.UPLOAD_STORAGE_DIR + node_name + "/" + config.LOGS_PER_MIN_DIR + "/";

        fs.mkdir(filepath, { recursive: true }, (err: any) => {
          if (err) {
            logger.debug('ERROR cant create uploadedDir ' + filepath + "" + err);
            responseHandler.sendResponse(res, "File permin upload failed " + err, 200, true);

          } else {

            file.mv(filepath + file.name, (err: any) => {

              if (err) {
                responseHandler.sendResponse(res, "File permin upload failed " + err, 200, true);
              } else {

                //CHECK IF PERMIN UPLOAD IS MORE THAN 20 FILES

                fs.readdir(filepath, (err: any, files: any) => {
                  if (err) {
                    //IFF ERROR ACCUR RERUN
                    logger.debug('Unable to scan ' + filepath + ' directory: ' + err);
                  }

                  files.sort();

                  let filesLen = files.length;

                  //IF THERES IS EVENTS DIR FETCH FIRST EVENT ONLY
                  if (filesLen > 20) {

                    let clearFile = files.slice(0, 10);

                    for (let i = 0; i < clearFile.length; i++) {

                      fs.unlink(filepath + clearFile[i], (err: any) => {

                        if (err) { logger.error("Error unlinking permin upload" + err); }
                      });
                    }

                  }
                })

                responseHandler.sendResponse(res, "File permin upload success", 200, false);
              }

            })

          }
        });
      } else {
        responseHandler.sendResponse(res, "File is undefined permin failed ", 200, true);
      }

    } catch (err) {
      logger.info("Error Permin upload file " + err);
      next(err)
    }
  }

  public async uploadEvents(req: any, res: Response, next: NextFunction) {

    try {

      if (!req.files) responseHandler.sendResponse(res, "No event file uploaded", 200, true);

      const { node_name, eventId } = req.body;


      let file = req.files?.file;

      if (file !== undefined) {
        let ip = req.ip;

        let filepath = config.UPLOAD_STORAGE_DIR + node_name + "/" + config.LOGS_EVENT_DIR + "/" + eventId + "/";

        fs.mkdir(filepath, { recursive: true }, (err: any) => {
          if (err) {
            logger.debug('ERROR cant create uploadedDir ' + filepath + "" + err);
            responseHandler.sendResponse(res, "File upload failed " + err, 200, true);

          } else {

            file.mv(filepath + file.name, (err: any) => {

              if (err) {
                responseHandler.sendResponse(res, "File event upload failed " + err, 200, true);
              } else {

                let data = {
                  orig_filename: file.name
                }

                responseHandler.sendResponse(res, "File event upload success", 200, false, data);
              }

            })

          }
        });

      } else {
        responseHandler.sendResponse(res, "File is undefined event failed ", 200, true);
      }

    } catch (err) {
      logger.info("Error Event upload file " + err);
      next(err)
    }
  }


  public async uploadEventMax(req: any, res: Response, next: NextFunction) {

    try {

      if (!req.files) responseHandler.sendResponse(res, "No file  max event uploaded", 200, true);

      const { node_name, eventId } = req.body;

      let file = req.files?.file;

      if (file !== undefined) {
        let ip = req.ip;

        let filepath = config.UPLOAD_STORAGE_DIR + node_name + "/" + config.LOGS_EVENT_MAX_DIR + "/";

        let content = file.data.toString('utf8').trim().split("\n");

        this.getAbsValues(content).then((result: any) => {

          fs.mkdir(filepath, { recursive: true }, (err: any) => {
            if (err) {
              logger.debug('ERROR cant create  max event ' + filepath + "" + err);
              responseHandler.sendResponse(res, "File  max event upload failed " + err, 200, true);

            } else {

              file.mv(filepath + file.name, (err: any) => {

                if (err) {
                  responseHandler.sendResponse(res, "File max event upload failed " + err, 400, true);
                } else {

                  let timePath = this.getTimePath();

                  let created_at = timePath['created_at'];

                  let path = filepath + file.name;

                  let sql = "INSERT INTO event_max (filename, intensity_max, x_max, y_max, z_max, year, month, day, hour, path, created_at, event_unique_id) " +
                    "VALUES (?,?,?,?,?,?,?,?,?,?,?,?)";

                  let param = [file.name, result[0], result[1], result[2], result[3],
                  timePath['year'], timePath['month'], timePath['days'], timePath['hours'],
                    path, created_at, eventId];


                  db.query(sql, param).then(qResult => {

                    let io = app.get('socketio');

                    console.log(result);

                    io.emit("event_max-" + eventId, result);

                    responseHandler.sendResponse(res, "File uploadEventMax success", 200, false);

                  }).catch(err => {

                    responseHandler.sendResponse(res, "File uploadEventMax failed 22" + err, 200, true);
                  });

                }

              })

            }
          });
        });

      } else {
        responseHandler.sendResponse(res, "File is undefined  max event failed ", 200, true);
      }


    } catch (err) {
      logger.info("Error  max event upload file " + err);
      next(err)
    }
  }


  getAbsValues(content: any) {

    return new Promise((res, rej) => {

      let xVal = 0;
      let yVal = 0;
      let zVal = 0;
      let intentVal = 0;

      try {

        for (let x = 0; x < content.length; x++) {

          let data = content[x].trim().split(',');

          let timestamp = parseInt(data[1]);
          let xvalIndex = parseFloat(data[2]);
          let yvalIndex = parseFloat(data[3]);
          let zvalIndex = parseFloat(data[4]);
          let intentIndex = parseInt(data[5]);

          // GET MAXIMUM INTENSITY ON FILE
          if (Math.abs(xvalIndex) > Math.abs(xVal)) {
            xVal = xvalIndex;
          }

          if (Math.abs(yvalIndex) > Math.abs(yVal)) {
            yVal = yvalIndex;
          }

          if (Math.abs(zvalIndex) > Math.abs(zVal)) {
            zVal = zvalIndex;
          }

          // GET MAXIMUM INTENSITY ON FILE
          if (intentIndex > intentVal) {
            intentVal = intentIndex;
          }

        }

        res([intentVal, xVal, yVal, zVal]);

      } catch (err) {
        rej(err);
      }


    })
  }




  public async firstAlarm(req: any, res: Response, next: NextFunction) {

    const { node_name, eventId } = req.body;

    let firstAlarmPath = config.UPLOAD_STORAGE_DIR + node_name + "/" + config.LOGS_FIRST_ALARM_DIR + "/" + eventId;
    console.log(firstAlarmPath);
    try {
      fs.mkdir(firstAlarmPath, { recursive: true }, (err: any) => {
        if (err) throw "Error make first alarm directory" + err;

        let timePath = this.getTimePath();

        let created_at = timePath['created_at'];

        let sql = "INSERT INTO warning_logs (node_name, event_unique_id, created_at, intensity) VALUES (?, ?, ?, ?)";

        // let param = [message[0], message[1], created_at, message[1].slice(-2)];

        let param = [node_name, eventId, created_at, eventId.slice(-2)];

        db.query(sql, param).then(res2 => {

          let io = app.get('socketio');

          let emitData = {
            "created_at": created_at,
            "node_name": param[0],
            "event_unique_id": param[1],
            "intensity": parseInt(param[3]),
          }

          io.emit("newfirstalarm", emitData);

          responseHandler.sendResponse(res, "First alarm upload success", 200, false);

        }).catch(err => {
          logger.info("Error Query first alarm event file " + err);

          responseHandler.sendResponse(res, "File firstalarm failed" + err, 200, true);
        });

      });

    } catch (err) {
      logger.info("Error first alarm event file " + err);
      responseHandler.sendResponse(res, "File firstalarm failed" + err, 200, true);
    }



    // try {



    //   console.log(firstAlarmPath);

    //   fs.mkdirSync(firstAlarmPath, { recursive: true }, (err: any) => {
    //     if (err) {
    //       throw "Error make first alarm directory 2" + err;
    //     }

    //     let timePath = this.getTimePath();

    //     let created_at = timePath['created_at'];

    //     let sql = "INSERT INTO warning_logs (node_name, event_unique_id, created_at) VALUES (?, ?, ?)";



    //     db.query(sql, param).then(res => {
    //       console.log("SAVE ", JSON.stringify(res));
    //     });

    //     let io = app.get('socketio');

    //     io.emit("newfirstalarm", [node_name, eventId]);

    //     responseHandler.sendResponse(res, "First alarm upload success", 200, false);

    //   });

    // } catch (err) {
    //   logger.info("Error Event upload file " + err);
    //   next(err)
    // }
  }

  pathsList: any = [];

  mapArray(array: any, fullpath: string, status: string) {
    return array.map(function (val: any, index: any) {

      return {
        "name": val,
        "path": fullpath + "/" + val,
        "status": status,
        "intensity": 0,
        "timestamp": val.substring(0, 13)
      };
    });
  }

  public async getHistory(req: Request, res: Response, next: NextFunction) {
    try {

      db.query("SELECT wl.created_at, wl.event_unique_id, wl.intensity, wl.node_name, em.intensity_max, em.x_max, em.y_max, em.z_max FROM warning_logs wl LEFT JOIN " +
        "event_max em ON (em.event_unique_id = wl.event_unique_id) ORDER BY wl.created_at DESC LIMIT 18",
        (err: any, warn_results: any) => {

          if (warn_results.length >= 1) {
            let data = {
              "history": warn_results,
            }

            responseHandler.sendResponse(res, "History fetched", 200, false, data);

          } else {
            responseHandler.sendResponse(res, "No History fetched", 200, true);
          }
        });

    } catch (err) {
      logger.info("Error fetching history" + err);
      next(err)
    }
  }

  public async getAllHistory(req: Request, res: Response, next: NextFunction) {
    try {

      db.query("SELECT wl.warn_id, wl.created_at, wl.event_unique_id, wl.intensity, wl.node_name, em.intensity_max, em.x_max, em.y_max, em.z_max FROM warning_logs wl LEFT JOIN " +
        "event_max em ON (em.event_unique_id = wl.event_unique_id) ORDER BY wl.warn_id DESC", (err: any, warn_results: any) => {

          if (warn_results.length >= 1) {
            let data = {
              "history": warn_results,
            }

            responseHandler.sendResponse(res, "History fetched", 200, false, data);

          } else {
            responseHandler.sendResponse(res, "No History fetched", 200, true);
          }

        });

    } catch (err) {
      logger.info("Error fetching history" + err);
      next(err)
    }
  }

  public async getWarningLogById(req: Request, res: Response, next: NextFunction) {
    try {

      let { warn_id } = req.body;

      db.query("SELECT * FROM warning_logs WHERE warn_id = ? LIMIT 1", [warn_id]).then((result: any) => {

        if (result.length >= 1) {


          responseHandler.sendResponse(res, "Warning log fetched", 200, false, result[0]);


        } else {
          responseHandler.sendResponse(res, "No Warning log fetched", 200, true);
        }

      }).catch(err => {
        responseHandler.sendResponse(res, "Failed to fetch warning log", 200, true);
      });

    } catch (err) {
      logger.info("Error fetching Warning log" + err);
      next(err)
    }
  }

  readDataLog(path: string) {
    let liner = new lineByLine(path);
    let line;
    let intent = 0;

    // //LOOP FILES CONTENT
    while (line = liner.next()) {
      // console.log('Line ' + lineNumber + ': ' + line.toString('ascii'));
      let data = line.toString().trim().split(',');
      //console.log(data);

      let intentIndex = parseInt(data[5]);

      // GET MAXIMUM INTENSITY ON FILE
      if (intentIndex > intent) {
        intent = intentIndex;
      }
    }
    return intent;
  }

  cBeforeAfter: number = 22;

  public async getBefore(req: Request, res: Response, next: NextFunction) {
    try {

      const { eventId, node_name } = req.body;

      let basePath = config.UPLOAD_STORAGE_DIR;

      let paths = [config.LOGS_EVENT_DIR];

      // let fullpath = basePath + node_name + "/" + paths[0] + "/" + eventId + "/";

      //let fullpath = path+"/";

      let fullpath = basePath + node_name + "/" + paths[0] + "/" + eventId + ".log";
      console.log(fullpath);
      console.log("Here");



      this.getPathDatasGraph(this.pathsList, fullpath, res, next);

      // fs.readdir(fullpath, (err: any, files: any) => {
      //   if (err) next(err)

      //   if (files) {

      //     files.sort();
      //     this.pathsList = files.slice(0, this.cBeforeAfter);


      //     console.log(this.pathsList);
      //     this.getPathDatasGraph(this.pathsList, fullpath, res, next);

      //   } else {
      //     responseHandler.sendResponse(res, "before data fetched", 200, true);
      //   }

      // });

    } catch (err) {
      logger.info("Error fetching history" + err);
      next(err)
    }
  }

  public async getDuring(req: Request, res: Response, next: NextFunction) {
    try {

      const { eventId, node_name } = req.body;

      let basePath = config.UPLOAD_STORAGE_DIR;

      let paths = [config.LOGS_EVENT_DIR];

      //let fullpath = basePath+paths[0]+"/"+eventId+"/";

      let fullpath = basePath + node_name + "/" + paths[0] + "/" + eventId + "/";

      fs.readdir(fullpath, (err: any, files: any) => {
        if (err) next(err)

        if (files) {

          files.sort();
          //this.pathsList = files.slice(0, this.cBeforeAfter);

          this.pathsList = files.splice(this.cBeforeAfter);


          this.pathsList.reverse();


          this.pathsList = this.pathsList.slice(this.cBeforeAfter);

          this.pathsList.sort();



          this.getPathDatasGraph(this.pathsList, fullpath, res, next);

        } else {
          responseHandler.sendResponse(res, "During22222 fetched", 200, true);
        }

      });

    } catch (err) {
      logger.info("Error fetching history" + err);
      next(err)
    }
  }


  public async getAfter(req: Request, res: Response, next: NextFunction) {
    try {

      const { eventId, node_name } = req.body;

      let basePath = config.UPLOAD_STORAGE_DIR;

      let paths = [config.LOGS_EVENT_DIR];

      //let fullpath = basePath+paths[0]+"/"+eventId+"/";

      let fullpath = basePath + node_name + "/" + paths[0] + "/" + eventId + "/";

      fs.readdir(fullpath, (err: any, files: any) => {
        if (err) next(err)


        if (files) {

          files.reverse();
          this.pathsList = files.slice(0, this.cBeforeAfter);

          this.pathsList.sort();

          console.log(this.pathsList);
          this.getPathDatasGraph(this.pathsList, fullpath, res, next);

        } else {
          responseHandler.sendResponse(res, "After data fetched", 200, true);
        }

      });

    } catch (err) {
      logger.info("Error fetching history" + err);
      next(err)
    }
  }

  data: any;

  // async getPathDatasGraph(paths: any, fullpath: string, res: Response, next: NextFunction) {

  //   let counter = 0;
  //   let pathsLen = paths.length;

  //   let totalIntent = 0;
  //   let totalX = 0;
  //   let totalY = 0;
  //   let totalZ = 0;

  //   let contentarray = [];

  //   for (var x = 0; x < pathsLen; x++) {
  //     // console.log(paths[x]['path']);

  //     let path = fullpath + paths[x];



  //     let result = this.readDataLogGraph(path);

  //     this.data = result[4];

  //     for (var i = 0; i < this.data.length; ++i) {


  //       let timestamp = this.data[i][0];
  //       let xvalIndex = this.data[i][1];
  //       let yvalIndex = this.data[i][2];
  //       let zvalIndex = this.data[i][3];
  //       let intentIndex = this.data[i][4];

  //       // GET MAXIMUM INTENSITY ON FILE
  //       if (Math.abs(xvalIndex) > Math.abs(totalX)) {
  //         totalX = xvalIndex;
  //       }

  //       if (Math.abs(yvalIndex) > Math.abs(totalY)) {
  //         totalY = yvalIndex;
  //       }

  //       if (Math.abs(zvalIndex) > Math.abs(totalZ)) {
  //         totalZ = zvalIndex;
  //       }

  //       // GET MAXIMUM INTENSITY ON FILE
  //       if (intentIndex > totalIntent) {
  //         totalIntent = intentIndex;
  //       }

  //       contentarray.push([1, timestamp, xvalIndex, yvalIndex, zvalIndex, intentIndex]);
  //     }

  //   }

  //   let data = {
  //     "pgaX": totalX,
  //     "pgaY": totalY,
  //     "pgaZ": totalZ,
  //     "intensity": totalIntent,
  //     "content": contentarray,
  //   }

  //   responseHandler.sendResponse(res, "History successfuly fetched", 200, false, data);
  // }


  async getPathDatasGraph(paths: any, fullpath: string, res: Response, next: NextFunction){

    let counter = 0;
    let pathsLen = paths.length;

    let totalIntent = 0;
    let totalX = 0;
    let totalY = 0;
    let totalZ = 0;

    let contentarray = [];

    let path = fullpath;

    console.log("Full path "+ path);

    let result = this.readDataLogGraph(path);

    console.log(result);



    this.data = result[4];

    for (var i = 0; i < this.data.length; ++i) {

      let timestamp = this.data[i][0];
      let xvalIndex = this.data[i][1];
      let yvalIndex = this.data[i][2];
      let zvalIndex = this.data[i][3];
      let intentIndex = this.data[i][4];

        // GET MAXIMUM INTENSITY ON FILE
      if (Math.abs(xvalIndex) > Math.abs(totalX)) {
        totalX = xvalIndex;
      }

      if (Math.abs(yvalIndex) > Math.abs(totalY)) {
        totalY = yvalIndex;
      }

      if (Math.abs(zvalIndex) > Math.abs(totalZ)) {
        totalZ = zvalIndex;
      }

      // GET MAXIMUM INTENSITY ON FILE
      if (intentIndex > totalIntent) {
        totalIntent = intentIndex;
      }

      contentarray.push([1, timestamp, xvalIndex, yvalIndex, zvalIndex, intentIndex]);
    }

    let data = {
      "pgaX": totalX,
      "pgaY": totalY,
      "pgaZ": totalZ,
      "intensity": totalIntent,
      "content": contentarray,
    }

    responseHandler.sendResponse(res, "History successfuly fetched", 200, false, data);
  }


  readDataLogGraph(path: string) {
    let liner = new lineByLine(path);
    let line;
    let intent = 0;
    let x = 0;
    let y = 0;
    let z = 0;

    let contentarray = [];
    // //LOOP FILES CONTENT
    while (line = liner.next()) {
      // console.log('Line ' + lineNumber + ': ' + line.toString('ascii'));
      let data = line.toString().trim().split(',');

      let timestamp = parseInt(data[1]);
      let xvalIndex = parseFloat(data[2]);
      let yvalIndex = parseFloat(data[3]);
      let zvalIndex = parseFloat(data[4]);
      let intentIndex = parseInt(data[5]);

      // GET MAXIMUM INTENSITY ON FILE
      if (Math.abs(xvalIndex) > Math.abs(x)) {
        x = xvalIndex;
      }

      if (Math.abs(yvalIndex) > Math.abs(y)) {
        y = yvalIndex;
      }

      if (Math.abs(zvalIndex) > Math.abs(z)) {
        z = zvalIndex;
      }

      // GET MAXIMUM INTENSITY ON FILE
      if (intentIndex > intent) {
        intent = intentIndex;
      }

      contentarray.push([
        timestamp,
        xvalIndex,
        yvalIndex,
        zvalIndex,
        intentIndex
      ]);
    }


    return [intent, x, y, z, contentarray];

  }




}