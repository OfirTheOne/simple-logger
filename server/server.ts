/** @author Ofir G.
 */

import * as express from "express";
import * as bodyParser from "body-parser";
import './config/config.ts';
import { appRoutes } from './routes/app.routes';
import { whiteOrgins } from './whitelist-orgins';
import { LoggerFactory } from "../simple-logger";

const logger = LoggerFactory.create();

const PORT = 3000;

class ExpressApp {

    public app: express.Application;

    constructor() {
        this.app = express();
        this._init();
    }

    private _init(): void {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        if(process.env.NODE_ENV !== 'test') {
            this.enableCrossOrgine();
        }
    }

    private enableCrossOrgine() {
        this.app.use((req, res, next) => {
            const origin = req.headers.origin as string;
            if(origin && whiteOrgins.indexOf(origin.trim()) > -1){
                res.setHeader('Access-Control-Allow-Origin', origin);
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
                res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                res.setHeader('Access-Control-Allow-Credentials', 'true');
            }
            // res.setHeader('Access-Control-Request-Headers', 'x-auth , x-provider')
            next();
        });
    }
}

const app = new ExpressApp().app;
app.use(logger.middleExpress({
        req: {
            usedLevel: 'info',
            usedOnPath: [],
            includeKeys: ['xhr', 'body', 'protocol'], 
        }
}));

app.use(appRoutes);


app.listen(process.env.PORT || PORT, () => {
    console.log(`server running on port ${process.env.PORT || PORT}`);
})

export { app } // export for testing
