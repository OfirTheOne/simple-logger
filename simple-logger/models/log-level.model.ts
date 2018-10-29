/** 
 * @module Simple-Logger
 * @author Genish Ofir 
 * @license ISC License 
 * @requires [colors/safe,json-stringify-safe] - (dependencies packages)
 * @description  simple & light logger service.
 */


export type SimpleLogLevel = { 'info', 'debug', 'warn', 'error' }

export type LogLevelMethod = (record: { message: string, params?: any } | string) => void