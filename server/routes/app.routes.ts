
/** @author Ofir G.
 */

import { Router } from 'express';
import * as _ from 'lodash';

import { LoggerFactory } from '../../simple-logger';
// import { myLogLevelSetting, logLevelsArray, MyLogLevels } from './logger-config'

// const logger = LoggerFactory.create<MyLogLevels>(logLevelsArray, {
//     appName: 'home',
//     logLevelsSettingTable:  myLogLevelSetting, 
//     logRecordsSpaceing: 1
// });

const logger = LoggerFactory.create({
    appName: 'home',
    logRecordsSpaceing: 2,
    // logLevelsSettingTable: [
    //     ['warn', {
    //         recordHeadFormat: ''
    //         replacers?: 
    //         recordTransformations: ,
    //         safeTransformation: ,
    //         maxBodyLength: ,
    //         silenced: , 
    //         silencedOnEnv: ,
    //         writeStream: ,
    //     }]
    // ]
});


class AppRoutes {

    public routes: Router;

    constructor() {
        this.routes = Router();
        this.initRoutes();
    }

    private initRoutes() {
        this.routes
            .get('/langs', (req, res) => {
                logger.info({ message: 'GET: \'/langs\'' });
                return res.status(200).send({ });
            })

            .post('/run', (req, res) => {
                logger.info({ message: 'POST: \'/run\'' });
                return res.status(200).send({ });
            })
    }
}

const appRoutes = new AppRoutes().routes;

export { appRoutes }

