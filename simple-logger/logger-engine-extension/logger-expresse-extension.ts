/** 
 * @module Simple-Logger
 * @author Genish Ofir 
 * @license ISC License 
 * @requires [colors/safe,json-stringify-safe] - (dependencies packages)
 * @description  simple & light logger service.
 */


import { LogLevelsSetting, LogLevelSettingEntry } from "../models";
import {
    LeggerExpressConfig,
    LeggerExpressParameterConfig,
    ExpressRequestProperties,
    ExpressResponseProperties,
    ExpressErrorProperties,
} from "../models/logger-express-config.model";

interface LoggerEngineInternal {
    logLevelsSetting: LogLevelsSetting<any>;
    engineStarter: (levelName: string, setting: LogLevelSettingEntry, record: { message: string, params?: any } | string) => void;
}
const DEFAULT_EXPRESS_PARAM = { usedOnPath: [],  filterKeys: [],  includeKeys: undefined }

export class LoggerExpressExtension {

    constructor() { }
    public getMiddleware(config: Partial<LeggerExpressConfig>, engineInternal: LoggerEngineInternal) {
        if (!config || !(Object.keys(config).length) || !engineInternal) { return; }
        const middleware = this.constructMiddleware(config, engineInternal);
        return middleware;
    }

    public getErrorMiddleware(config: Partial<LeggerExpressConfig>, engineParts: LoggerEngineInternal) {
        if (!config || !(Object.keys(config).length) || !engineParts) { return; }
        const errorMiddleware = this.constructErrorMiddleware(config, engineParts);
        return errorMiddleware;
    }

    private constructMiddleware(config: Partial<LeggerExpressConfig>, engineInternal: LoggerEngineInternal) {
        return (function middleware(req: any, res: any, next: (err?) => void) {
            const curMethod = req.method;
            const curUrl = req.originalUrl;

            if (config.req) {
                const reqConfig = Object.assign(DEFAULT_EXPRESS_PARAM, config.req);
                logParam<ExpressRequestProperties>(req, reqConfig, curMethod, curUrl, engineInternal);
            }
            if (config.res) {
                const resConfig = Object.assign(DEFAULT_EXPRESS_PARAM, config.res);
                logParam<ExpressResponseProperties>(res, resConfig, curMethod, curUrl, engineInternal);
            }
            next();
        })
    }

    private constructErrorMiddleware(config: Partial<LeggerExpressConfig>, engineInternal: LoggerEngineInternal) {
        return (function middleware(err: any, req: any, res: any, next: (err?) => void) {
            const curMethod = req.method;
            const curUrl = req.originalUrl;

            if (config.err) {
                const resConfig = Object.assign(DEFAULT_EXPRESS_PARAM, config.err);
                logParam<ExpressErrorProperties>(err, resConfig, curMethod, curUrl, engineInternal);
            }
            if (config.req) {
                const reqConfig = Object.assign(DEFAULT_EXPRESS_PARAM, config.req);
                logParam<ExpressRequestProperties>(req, reqConfig, curMethod, curUrl, engineInternal);
            }
            if (config.res) {
                const resConfig = Object.assign(DEFAULT_EXPRESS_PARAM, config.res);
                logParam<ExpressResponseProperties>(res, resConfig, curMethod, curUrl, engineInternal);
            }
            next();
        })
    }
}

function logParam<KEYS>(params: any, config: LeggerExpressParameterConfig<KEYS>, curMethod: string, curPath: string, engineInternal: LoggerEngineInternal) {
    const { engineStarter, logLevelsSetting } = engineInternal;
    const { usedLevel } = config;
    if (config.usedOnPath.length > 0 && 
        !(config.usedOnPath.some(val => (val.method.toUpperCase() === curMethod && val.path === curPath)))) { return; }
    if (!logLevelsSetting.has(usedLevel)) { return; }

    const levelSetting = logLevelsSetting.get(usedLevel);
    const message = `${curMethod} : ${curPath}`;
    const setting = margeConfigSetting(config, levelSetting);

    engineStarter(usedLevel, setting, {message, params});
}

function margeConfigSetting (config: LeggerExpressParameterConfig<any>, levelSetting: LogLevelSettingEntry) {
    let toAssign = {};
    if(config.filterKeys) {
        toAssign['filterKeys'] = config.filterKeys.concat(levelSetting.filterKeys || []);;
    }
    if(config.includeKeys) {
        toAssign['includeKeys'] = config.includeKeys.concat(levelSetting.includeKeys || []);;
    }

    return Object.assign(levelSetting, toAssign) as LogLevelSettingEntry;
}