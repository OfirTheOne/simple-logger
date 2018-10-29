/** 
 * @module Simple-Logger
 * @author Genish Ofir 
 * @license ISC License 
 * @requires [colors/safe,json-stringify-safe] - (dependencies packages)
 * @description  simple & light logger service.
 */


export interface FlatLogRecord {
    head: string,
    body: string
}

export interface LogRecord {
    head: LogRecordHead,
    body: LogRecordBody
}

export interface LogRecordHead {
    name: string,
    level: string,
    time: string,
}

export interface LogRecordBody {
    message: string,
    params?: any
}
