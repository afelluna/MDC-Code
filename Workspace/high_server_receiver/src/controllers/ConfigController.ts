import { Request, Response, NextFunction } from "express";
import mtz from "moment-timezone";
import Database from "../database/mysqldatabase";
import logger from "../config/logger";
import ResponseHandler from "../middleware/responseHandler";
import config from "../config/config";
import fsExtra from "fs-extra";


//const fsExtra     = require('fs-extra'); //FOR MOVING FILES
import path from "path";

const lineByLine      = require('n-readlines');
const fs              = require('fs');
const responseHandler = new ResponseHandler(); 
const date            = mtz().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');
const db              = new Database();

export class ConfigController{

  public sql: string = "";
  public param: any = [];
  public result: any;
  public newResult: any;

  constructor() {
      
  }

  public async mysqltest(req: Request, res: Response, next: NextFunction){
   
    try {
      //const { type } = req.body;

      //let result = await db.query("SELECT * FROM config_tbl");

      const connection = db.connection();
      
      connection.beginTransaction((err: any) => {
        if (err) { next(err) }

        connection.query('SELECT * FROM config_tbl LIMIT 1', (err: any, result: any, fields: any) => {
          if (err) { return connection.rollback(() => { next(err) }) }
          
          connection.commit((err: any) => {
              if (err) { connection.rollback(() => { next(err) }) }
             

              responseHandler.sendResponse(res, "Upload event file success", 200, false, result);
            })
          
        })
      })

    } catch (err) {
      logger.info(err);
      next(err)
    }
 
  } 

  public async getAllNodeInfo(req: Request, res: Response, next: NextFunction){
    try {

      db.query("SELECT n.*, np.positive_x_magni, np.positive_y_magni, np.positive_z_magni, np.node_location FROM nodes n JOIN node_profiles np ON (n.node_id = np.node_id) ORDER BY n.project DESC", (err: any, result: any) => {
        if (err) {
          responseHandler.sendResponse(res, "Failed to fetch sensor info "+ JSON.stringify(err), 200, true); 
        }else{
          responseHandler.sendResponse(res, "Successfuly fetch sensor config", 200, false, result);   
        }

      });
    } catch (err){
      logger.info("Error fetch sensor config "+err);
      next(err)
    }
  }  

  public async getNodeInfo(req: Request, res: Response, next: NextFunction){
    try {

      const { node_name } = req.body;

      let sql = "SELECT n.*, np.positive_x_magni, np.positive_y_magni, np.positive_z_magni, np.node_location FROM nodes n JOIN node_profiles np ON (n.node_id = np.node_id) WHERE n.node_name = ? LIMIT 1";
      let param = [node_name];

      db.query(sql, param).then((result: any) => {
        responseHandler.sendResponse(res, "Successfuly fetch sensor config", 200, false, result[0]);  
      }).catch(err => {
        responseHandler.sendResponse(res, "Failed to fetch sensor info", 200, true); 
      });

    } catch (err){
      logger.info("Error fetch sensor config "+err);
      next(err)
    }
  }  

  public async getIntensitySettings(req: Request, res: Response, next: NextFunction){
    try {

      db.query("SELECT * FROM intensity_configs LIMIT 1", (err: any, result: any) => {
        if (err) {
          responseHandler.sendResponse(res, "Failed to fetch intensity info", 200, true); 
        }else{
          responseHandler.sendResponse(res, "Successfuly fetch intensity config", 200, false, result[0]);   
        }

      });
    } catch (err){
      logger.info("Error fetch intensity config "+err);
      next(err)
    }
  }  


  public async updateIntensity(req: Request, res: Response, next: NextFunction){
    try {

      const { warning_min, alert_min, green_light, yellow_light, red_light } = req.body;

      let sql = "UPDATE intensity_configs SET warning_min = ?, alert_min = ?, green_light = ?, yellow_light = ?, red_light = ?";

      let param = [warning_min, alert_min, green_light, yellow_light, red_light];

      db.query(sql, param).then(result => {
        responseHandler.sendResponse(res, "Successfuly update intensity info", 200, false); 
      }).catch(err => {
        responseHandler.sendResponse(res, "Error update intensity info", 200, true); 
      });

 
    } catch (err){
      logger.info("Error fetch intensity config "+err);
      next(err)
    }
  }  

  public async updateNodeConfig(req: Request, res: Response, next: NextFunction){
    try {

      const { node_id, positive_x_magni, positive_y_magni, positive_z_magni,
              sensor_ip, monitor_ip, node_token } = req.body;

      let sql = "UPDATE node_profiles np, nodes n SET np.positive_x_magni = ?, np.positive_y_magni = ?, np.positive_z_magni = ?, n.sensor_ip = ?, n.monitor_ip = ?, n.node_token = ? "
                +"WHERE n.node_id = ? AND np.node_id = ?";

      let param = [ positive_x_magni, positive_y_magni, positive_z_magni,
              sensor_ip, monitor_ip, node_token, node_id, node_id ];

      db.query(sql, param).then(result => {
        responseHandler.sendResponse(res, "Successfuly update node config info", 200, false); 
      }).catch(err => {
        responseHandler.sendResponse(res, "Error update config info", 200, true); 
      });

 
    } catch (err){
      logger.info("Error fetch intensity config "+err);
      next(err)
    }
  }  


  public async loginUser(req: Request, res: Response, next: NextFunction){
    try {

      const { username, password } = req.body;

      let sql = "SELECT * FROM account_tbl WHERE username = ? AND password = ?";
      let param = [username, password];

      db.query(sql, param).then((result: any) => {


        if (result.length >= 1) {

          responseHandler.sendResponse(res, "Successfuly Login", 200, false);  

        }else{
          responseHandler.sendResponse(res, "Invalid Account Login", 200, true);  
        }


      }).catch(err => {
        responseHandler.sendResponse(res, "Failed to query account ", 200, true); 
      });

    } catch (err){
      logger.info("Error login "+err);
      next(err)
    }
  }  

  public async changePass(req: Request, res: Response, next: NextFunction){
    try {

      const { newpassword } = req.body;

      let sql = "UPDATE account_tbl SET password = ?";
      let param = [newpassword];

      db.query(sql, param).then((result: any) => {

       responseHandler.sendResponse(res, "Successfuly change password Login", 200, false);

      }).catch(err => {
        responseHandler.sendResponse(res, "Failed to change password account ", 200, true); 
      });

    } catch (err){
      logger.info("Error login "+err);
      next(err)
    }
  }  

}