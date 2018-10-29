/** 
 * @module Simple-Logger
 * @author Genish Ofir 
 * @license ISC License 
 * @requires [colors/safe,json-stringify-safe] - (dependencies packages)
 * @description  simple & light logger service.
 */


import { LoggerEngineOptions } from "./logger-engine-options.model";
import { LogLevelsSetting } from "./log-level-setting.model";
import { LogRecord } from "./log-record.model";


export abstract class AbstractLoggerEngine<L> {
    /** @member options - 
     *  @type LoggerEngineOptions<L> 
     */
    protected abstract options: LoggerEngineOptions<L>;
    /** @member logLevelsSetting - 
     *  @type LogLevelsSetting<L> 
     */
    protected abstract logLevelsSetting: LogLevelsSetting<L>;
    /** @member logLevels - this Logger levels array.
     *  @type Array<keyof L> 
     */
    protected abstract logLevels: Array<keyof L>; 
    
    constructor() {};

    public abstract silence(level: keyof L): void;
    public abstract silenceALL(): void;
    public abstract silenceALLBut(levels: Array<keyof L>): void;

    protected abstract processLogRequest(level: keyof L, record: { message: string, params?: any } | string): void;
    // protected abstract writeRecord(level: keyof L, transformedRecord: { head: string, body: string }): void;
    // protected abstract stringifyRecord(record: LogRecord,  headFormat: string, replacers): { head: string, body: string };
    // protected abstract transformRecord(level: keyof L, stringifiedRecord:{ head: string, body: string }): { head: string, body: string } ;
}