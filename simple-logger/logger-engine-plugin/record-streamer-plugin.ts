/** 
 * @module Simple-Logger
 * @author Genish Ofir 
 * @license ISC License 
 * @requires [colors/safe,json-stringify-safe] - (dependencies packages)
 * @description  simple & light logger service.
 */

import { createWriteStream, statSync } from "fs";
import { Writable } from "stream";
import { FlatLogRecord, LoggerWriteStream, LoggerFileWriteStream, LoggerConsoleWriteStream } from "../models";

export abstract class AbstractRecordStreamerPlugin {
    public abstract write(flatRecord: FlatLogRecord, writeStream: LoggerWriteStream): void;
}
export class RecordStreamerPlugin implements AbstractRecordStreamerPlugin {
    constructor(private spacing: number) { }

    public write(flatRecord: FlatLogRecord, writeStream: LoggerWriteStream) {
        const contentToWrite = this.compose(flatRecord);
        try {
            if (this.isConsoleWriteStream(writeStream)) { // console
                this.writeToConsoleStream(writeStream, contentToWrite)
            } else if (this.isFileWriteStream(writeStream)) { // file
                this.writeToFileStream(writeStream, contentToWrite)
            }
        } catch (error) {
            console.log('failed to write log-record');
        }
    }

    // #region - internal
    private compose(flatRecord: FlatLogRecord) {
        // TODO : think if composition options are needed.
        const { head, body } = flatRecord;
        const composedContent = head + '\n' + body + '\n' + this.recordSpacer(this.spacing);
        return composedContent;
    }   
    private writeToFileStream(writeStream: LoggerFileWriteStream, content: string) {
        if (!writeStream.stream) {
            writeStream.stream = createWriteStream(
                writeStream.fullFilePath,
                { flags: 'a' } // append flag
            );
        }

        const stats = statSync(writeStream.fullFilePath)
        const fileSizeInBytes = stats.size
        const fileSizeInKB = this.byteToKB(fileSizeInBytes);

        if (fileSizeInKB < writeStream.maxFileSize) {
            writeStream.stream.write(content);
        }
    }
    private writeToConsoleStream(writeStream: LoggerConsoleWriteStream, content: string) {
        writeStream.stream.write(content);
    }

    // #region - type guard
    private isConsoleWriteStream(writeStream): writeStream is LoggerConsoleWriteStream {
        return typeof writeStream === 'object'
            && (writeStream as object).hasOwnProperty('outletType')
            && (writeStream as object).hasOwnProperty('stream')
            && !(writeStream as object).hasOwnProperty('fullFilePath')
            && !(writeStream as object).hasOwnProperty('maxFileSize')
            && writeStream.outletType === 'console'
            && writeStream.stream instanceof Writable
    }
    private isFileWriteStream(writeStream): writeStream is LoggerFileWriteStream {
        return typeof writeStream === 'object'
            && (writeStream as object).hasOwnProperty('outletType')
            && (writeStream as object).hasOwnProperty('fullFilePath')
            && (writeStream as object).hasOwnProperty('maxFileSize')
            && writeStream.outletType === 'file'
            && typeof writeStream.maxFileSize === 'string'
            && typeof writeStream.maxFileSize === 'number'
    }
    // #endregion

    // #region - utils
    private recordSpacer(lines: number) {
        return new Array(lines).fill(0).reduce((l, s) => l + '\n', '');
    }
    /** 
     * @description convert byte to kiloBytes, round to integer.
     */
    private byteToKB(bytes: number): number {
        if (bytes <= 0) {
            return 0;
        } else {
            const kbResult = bytes >> 10; // (bytes / 2^10) ==> (bytes / 1024) ==> bytes to kb.
            return kbResult; // auto rounded;
        }
    }
    // #endregion
    
    // #endregion
}
