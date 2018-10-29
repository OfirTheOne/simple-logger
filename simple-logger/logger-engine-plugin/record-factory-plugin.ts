/** 
 * @module Simple-Logger
 * @author Genish Ofir 
 * @license ISC License 
 * @requires [colors/safe,json-stringify-safe] - (dependencies packages)
 * @description  simple & light logger service.
 */

import { LogRecord } from '../models/log-record.model'

// result in a format : Sat, May 05, 2018, 11:37:15 AM
const DEFAULT_TIMESTAMP_OPTIONS: Intl.DateTimeFormatOptions = {
    weekday: 'short', year: 'numeric', month: 'long',
    day: '2-digit', hour: '2-digit', minute: '2-digit',
    second: '2-digit'
};

interface RecordFactoryOptions {
    includeKeys?: string[], 
    filterKeys?: string[]
}

export abstract class AbstractRecordFactoryPlugin {
    public abstract create(name: string, level: string, message: string, params: any, options: RecordFactoryOptions): LogRecord;
}
export class RecordFactoryPlugin implements AbstractRecordFactoryPlugin{

    protected timeStampOptions: Intl.DateTimeFormatOptions;

    constructor(timeStampOptions?: Intl.DateTimeFormatOptions) {
        this.timeStampOptions = timeStampOptions || DEFAULT_TIMESTAMP_OPTIONS;
    }
    public create(name: string, level: string, message: string, params: any, options: RecordFactoryOptions): LogRecord {
        const record: LogRecord = {
            head: {
                name,
                level: this.logLevelToString(level),
                time: this.getTimeStamp(),
            },
            body: params? 
                { message, params: this.filter(params, options.includeKeys, options.filterKeys) } : 
                { message } 
        }
        return record;
    }

    private getTimeStamp(): string {
        const time = new Date(Date.now());
        const timeStamp = time.toLocaleDateString("en-US", this.timeStampOptions);
        return timeStamp;
    }

    private logLevelToString(level: string = 'level'): string {
        return level.toLowerCase()
        
        // switch (level) {
        //     case 'INFO':
        //         return 'Info'
        //     case LogLevel.DEBUG:
        //         return 'Debug'
        //     case LogLevel.WARN:
        //         return 'Warn'
        //     case LogLevel.ERROR:
        //         return 'Error'
        //     default:
        //         break;
        // }
    }

    private filter(params: any, includeKeys: string[], filterKeys: string[]) {
        let mutatedParams;
        if(includeKeys) {
            mutatedParams = filterIn(params, includeKeys)
        } else if(filterKeys) {
            mutatedParams = filterOut(params, includeKeys)
        }
        return mutatedParams;
    }
}

function filterIn(original: object, keys: string[]): object {
    if(!original || !keys || !keys.length) { return original; }
    return keys.reduce<object>((filtered, key) => { 
        return (original[key] === undefined) ?  filtered : { ...filtered, [`${key}`]: original[key] } 
    }, {});
}

function filterOut(original: object, keys: string[]): object {
    if(!original || !keys || !keys.length) { return original; }
    const originalCopy = Object.assign({}, original) as object;
    keys.forEach(key => (originalCopy.hasOwnProperty(key) ? delete originalCopy[key]: undefined));
    return originalCopy;
}
