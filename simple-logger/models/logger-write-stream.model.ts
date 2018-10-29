/** 
 * @module Simple-Logger
 * @author Genish Ofir 
 * @license ISC License 
 * @requires [colors/safe,json-stringify-safe] - (dependencies packages)
 * @description  simple & light logger service.
 */

 import { WriteStream } from "fs";

export interface LoggerFileWriteStream {
    outletType:  'file';
    fullFilePath: string; // file path + name
    maxFileSize: number; // in kb
    stream?: WriteStream; 
}
export interface LoggerConsoleWriteStream {
    outletType: 'console';
    stream: NodeJS.WriteStream
}
export type LoggerWriteStream = LoggerConsoleWriteStream | LoggerFileWriteStream;

