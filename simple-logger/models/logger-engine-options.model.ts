/** 
 * @module Simple-Logger
 * @author Genish Ofir 
 * @license ISC License 
 * @requires [colors/safe,json-stringify-safe] - (dependencies packages)
 * @description  simple & light logger service.
 */

import { LogLevelsSettingTable } from "./log-level-setting.model";
import { 
    AbstractRecordTransformerPlugin, 
    AbstractRecordStringifierPlugin, 
    AbstractRecordStreamerPlugin,
    AbstractRecordFactoryPlugin
} from '../logger-engine-plugin';

export interface LoggerEngineOptions<L> {
    appName: string,
    logLevelsSettingTable: LogLevelsSettingTable<L>
    logRecordsSpaceing: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
    plugins: Partial<LoggerEnginePlugins>
}

export interface LoggerEnginePlugins {
    steramer: AbstractRecordStreamerPlugin,
    transformer: AbstractRecordTransformerPlugin,
    stringifier: AbstractRecordStringifierPlugin,
    factory: AbstractRecordFactoryPlugin
}


