import * as Express from "express";

import { Request, Response, NextFunction } from "express";

import { check, body } from "express-validator";
import validate from "../middleware/validate";

import config from "../config/config";
import logger from "../config/logger";

import { UploadController } from "../controllers/UploadController";
import { ConfigController } from "../controllers/ConfigController";

const router = Express.Router();

let uploadCtrl = new UploadController();
let configCtrl = new ConfigController();

router.post('/firstAlarm', [
		check('node_name', 'node name is required').not().isEmpty(),
		check('eventId', 'eventId is required').not().isEmpty(),
	], (req: Request, res: Response, next: NextFunction) => {

		validate(req, res, next);
	}, uploadCtrl.firstAlarm.bind(uploadCtrl));

router.post('/uploadPermin', [
		check('node_name', 'node name is required').not().isEmpty(),
	], (req: Request, res: Response, next: NextFunction) => {

		validate(req, res, next);
	}, uploadCtrl.uploadPermin.bind(uploadCtrl));

router.post('/upload', [
		check('node_name', 'node name is required').not().isEmpty(),
	], (req: Request, res: Response, next: NextFunction) => {

		validate(req, res, next);
	}, uploadCtrl.firstAlarm.bind(uploadCtrl));


router.post('/uploadEvents', [
		check('node_name', 'node name is required').not().isEmpty(),
		check('eventId', 'eventId is required').not().isEmpty(),
	], (req: Request, res: Response, next: NextFunction) => {

		validate(req, res, next);
	}, uploadCtrl.uploadEvents.bind(uploadCtrl));

router.get('/getHistory', [
	], (req: Request, res: Response, next: NextFunction) => {
		validate(req, res, next);
	}, uploadCtrl.getHistory.bind(uploadCtrl));


router.post('/getWarningLogById', [
		check('warn_id', 'warn_id is required').not().isEmpty(),
	], (req: Request, res: Response, next: NextFunction) => {
		validate(req, res, next);
	}, uploadCtrl.getWarningLogById.bind(uploadCtrl));


router.get('/getAllHistory', [
	], (req: Request, res: Response, next: NextFunction) => {
		validate(req, res, next);
	}, uploadCtrl.getAllHistory.bind(uploadCtrl));

router.get('/getAllNodeInfo', [
	], (req: Request, res: Response, next: NextFunction) => {
		validate(req, res, next);
	}, configCtrl.getAllNodeInfo.bind(configCtrl));

router.post('/getNodeInfo', [
	 	check('node_name', 'node_name is required').not().isEmpty(),
	], (req: Request, res: Response, next: NextFunction) => {
		validate(req, res, next);
	}, configCtrl.getNodeInfo.bind(configCtrl));

router.get('/getIntensitySettings', [
	], (req: Request, res: Response, next: NextFunction) => {
		validate(req, res, next);
	}, configCtrl.getIntensitySettings.bind(configCtrl));


router.post('/updateIntensity', [
		check('warning_min', 'warning_min is required').not().isEmpty(),
		check('alert_min', 'alert_min is required').not().isEmpty(),
	], (req: Request, res: Response, next: NextFunction) => {
		validate(req, res, next);
	}, configCtrl.updateIntensity.bind(configCtrl));

router.post('/updateNodeConfig', [
		check('node_id', 'node_id is required').not().isEmpty(),
		check('positive_x_magni', 'positive_x_magni is required').not().isEmpty(),
		check('positive_y_magni', 'positive_y_magni is required').not().isEmpty(),
		check('positive_z_magni', 'positive_z_magni is required').not().isEmpty(),
		check('sensor_ip', 'sensor_ip is required').not().isEmpty(),
		check('monitor_ip', 'monitor_ip is required').not().isEmpty(),
		check('node_token', 'node_token is required').not().isEmpty(),
	], (req: Request, res: Response, next: NextFunction) => {
		validate(req, res, next);
	}, configCtrl.updateNodeConfig.bind(configCtrl));

router.post('/getBefore', [
		check('eventId', 'eventId is required').not().isEmpty(),
		check('node_name', 'node_name is required').not().isEmpty(),
	], (req: Request, res: Response, next: NextFunction) => {

		validate(req, res, next);
	}, uploadCtrl.getBefore.bind(uploadCtrl));

router.post('/getAfter', [
		check('eventId', 'eventId is required').not().isEmpty(),
		check('node_name', 'node_name is required').not().isEmpty(),
	], (req: Request, res: Response, next: NextFunction) => {

		validate(req, res, next);
	}, uploadCtrl.getAfter.bind(uploadCtrl));

router.post('/getDuring', [
		check('eventId', 'eventId is required').not().isEmpty(),
		check('node_name', 'node_name is required').not().isEmpty(),
	], (req: Request, res: Response, next: NextFunction) => {

		validate(req, res, next);
	}, uploadCtrl.getDuring.bind(uploadCtrl));


router.post('/loginUser', [
	 	check('username', 'username is required').not().isEmpty(),
	 	check('password', 'password is required').not().isEmpty(),
	], (req: Request, res: Response, next: NextFunction) => {
		validate(req, res, next);
	}, configCtrl.loginUser.bind(configCtrl));

router.post('/changePass', [
	 	// check('username', 'username is required').not().isEmpty(),
	 	check('newpassword', 'password is required').not().isEmpty(),
	], (req: Request, res: Response, next: NextFunction) => {
		validate(req, res, next);
	}, configCtrl.changePass.bind(configCtrl));

router.post('/uploadEventMax', [
		check('node_name', 'node name is required').not().isEmpty(),
		check('eventId', 'eventId is required').not().isEmpty(),
	], (req: Request, res: Response, next: NextFunction) => {

		validate(req, res, next);
	}, uploadCtrl.uploadEventMax.bind(uploadCtrl));


export default router;