/** 
 * @module Simple-Logger
 * @author Genish Ofir 
 * @license ISC License 
 * @requires [colors/safe,json-stringify-safe] - (dependencies packages)
 * @description  simple & light logger service.
 */


import { LoggerWriteStream } from "./logger-write-stream.model";

export interface LogRecordTransformations {
    head: ((str: string) => string)[],
    body: ((str: string) => string)[]
} 

export type LogLevelsSetting<L> = Map<keyof L, LogLevelSettingEntry>;

export type LogLevelsSettingTable<L> = Array<[keyof L, LogLevelSettingEntry]>;

export interface LogLevelSettingEntry {
    
    includeKeys?: string[],                             // createOptions
    filterKeys?: string[],                              // createOptions

    /** 
     * @description [recordHeadFormat]
     *  This format is used to configure the record head form.
     *  Any key word with prefix of '%' will a placeholder for that key value.
     *  Acceptable keys are 'name', 'level' and 'time'.
     * @example 
     *  { appName: 'myApp', logLevel: 'info', time: '...some-date' }
     *  format : '%name || %level [%time]'
     *  result head: 'myApp || info [...some-date]'
     * @example 
     *  { appName: 'myApp', logLevel: 'info', time: '...some-date' }
     *  format : '%level :: %time' 
     *  result head: 'info :: ...some-date'
     */
    recordHeadFormat: string,                           // stringifyOptions
    replacers?: ((key: string, value: any) => any),     // stringifyOptions

    recordTransformations: LogRecordTransformations,    // transformOptions
    safeTransformation?: true,                          // transformOptions

    writeStream: LoggerWriteStream,                     // streamOptions
    fallbackStream?: LoggerWriteStream,                 // streamOptions

    /** 
     * @description [silencedOnEnv]
     *  An array of envaironments to silence writhing to the stream only on this logLevel.
     * @example 
     *  silencedOnEnv: ['test', 'prod'],
     *  process.env.NODE_ENV value is 'test',
     *  this logLevel stream will be silenced.
     * @example 
     *  silencedOnEnv: ['test', 'prod'],
     *  process.env.NODE_ENV value is 'production',
     *  this logLevel stream WILL NOT be silenced, 
     *  'production' not included in ['test', 'prod'].
     */
    silencedOnEnv: string[],                            // globalOptions
    silenced: boolean,                                  // globalOptions
    maxRecoredLength: number                            // globalOptions

}

/* 
    includeKeys?: ,
    filterKeys?: ,
    recordHeadFormat: ,
    replacers?: ,
    recordTransformations: ,
    safeTransformation: ,
    writeStream: ,
    fallbackStream? ,
    silenced?: , 
    silencedOnEnvs: ,
    maxRecoredLength: ,
*/

interface DevSettingEntry {
    createOptions: {
        includeKeys?: string[],
        filterKeys?: string[],
    },

    stringifyOptions: {
        recordHeadFormat: string,
        replacers: ((key: string, value: any) => any), 
        circularPlaceholder: string, 
    },
    
    transformOptions: {
        recordTransformations: LogRecordTransformations,
        safeTransformation?: true,
    },

    writeOptions: {
        stream: LoggerWriteStream,
        fallbackStream?: LoggerWriteStream,
    }, 
}



