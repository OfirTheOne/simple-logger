/** 
 * @module Simple-Logger
 * @author Genish Ofir 
 * @license ISC License 
 * @requires [colors/safe,json-stringify-safe] - (dependencies packages)
 * @description  simple & light logger service.
 */

import * as colors from 'colors/safe';
import { LogLevelsSettingTable } from "../models/log-level-setting.model";
import { LoggerEngineOptions } from "../models/logger-engine-options.model";
import { SimpleLogLevel } from '../models/log-level.model'


export const DEFAULT_LOG_LEVALS_ARRAY : Array<keyof SimpleLogLevel> = [ 'info', 'debug', 'warn', 'error' ];
export const DEFAULT_HEADER_FORMAT = '%name | %level :: %time';
const DEFAULT_LOGGER_NAME = 'my-app';
const DEFAULT_LOG_RECORDS_SPACEING = 1;
const DEFAULT_LEVELS_SETTING_TABLE: LogLevelsSettingTable<SimpleLogLevel> = [
    [('info' as keyof SimpleLogLevel), {
        writeStream: { outletType: 'console', stream: process.stdout },
        recordTransformations: { body: [colors.green], head: [colors.green, colors.underline] },
        recordHeadFormat: DEFAULT_HEADER_FORMAT,
        filterKeys: ['message'],
        silenced: false,
        maxRecoredLength: -1,
        silencedOnEnv: ['test']
    }],
    [('debug' as keyof SimpleLogLevel), {
        writeStream: { outletType: 'console', stream: process.stdout },
        recordHeadFormat: DEFAULT_HEADER_FORMAT,
        recordTransformations: { body: [colors.blue], head: [colors.blue, colors.underline] },
        silenced: false,
        maxRecoredLength: -1,
        silencedOnEnv: ['test']
    }],
    [('warn' as keyof SimpleLogLevel), {
        writeStream: { outletType: 'console', stream: process.stdout },
        recordHeadFormat: DEFAULT_HEADER_FORMAT,
        recordTransformations: { body: [colors.yellow, colors.bold], head: [colors.yellow, colors.bold, colors.underline] },
        silenced: false,
        maxRecoredLength: -1,
        silencedOnEnv: ['test']
    }],
    [('error' as keyof SimpleLogLevel), {  
        writeStream: { outletType: 'console', stream: process.stdout },
        recordHeadFormat: DEFAULT_HEADER_FORMAT,
        recordTransformations: { body: [colors.red], head: [colors.red, colors.underline] },
        silenced: false,
        maxRecoredLength: -1,
        silencedOnEnv: ['test']
    }],
];
export const DEFAULT_ENGINE_OPTIONS: LoggerEngineOptions<SimpleLogLevel> = {
    appName: DEFAULT_LOGGER_NAME,
    logLevelsSettingTable: DEFAULT_LEVELS_SETTING_TABLE,
    logRecordsSpaceing: DEFAULT_LOG_RECORDS_SPACEING, 
    plugins: {},
    
}
