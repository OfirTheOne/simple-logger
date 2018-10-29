/** 
 * @module Simple-Logger
 * @author Genish Ofir 
 * @license ISC License 
 * @requires [colors/safe,json-stringify-safe] - (dependencies packages)
 * @description  simple & light logger service.
 */

import {format} from 'util'; 
import * as stringify from "json-stringify-safe";
import { LogRecord, FlatLogRecord } from "../models";

export abstract class AbstractRecordStringifierPlugin {
    public abstract stringify(record: LogRecord, headerFormat: string, 
        replacers?: ((key: string, value: any) => string) | string[]): FlatLogRecord;
}

export class RecordStringifierPlugin implements AbstractRecordStringifierPlugin {

    private interpolator: Interpolator

    constructor() {
        this.interpolator = new Interpolator(new RegExp(/(%\S+)+/g), 1);
    }

    public stringify(record: LogRecord, headerFormat: string, 
        replacers?: ((key: string, value: any) => string) | string[]): FlatLogRecord {

            let filtered: (key: string, value: any) => string = undefined;
            
            if(Array.isArray(replacers)) {
                filtered = function (key: string, value: any) {
                    return ~replacers.indexOf(key)? '[filtered]' : value;
                }
            } else if(typeof replacers === 'function') {
                filtered = replacers;
            }
        return this.flat(record, headerFormat.trim(), filtered)
    }

    // #region - internal
    private flat(record: LogRecord, format: string, replacers: (key: string, value: any) => string): FlatLogRecord {
        const head = record.head as any as ({ [key: string]: string });
        const interpolatedHead = this.interpolator.interpolation(head, format);
        const stringifiedBody = this.safeStringify(record.body, replacers);
        return { head: interpolatedHead, body: stringifiedBody }
    }
    private safeStringify(target: any, replacers: (key: string, value: any) => string, indent?: number) {
        const stringifyBody = stringify(
            { message: target.message, params: target.params }, 
            replacers, 
            2
        );
        return stringifyBody;
    }

}


/***************************** Interpolator implementetion *****************************/

interface InterpolatorCacheEntry { text: string; targetKeys: string[]; normalizedText: string; };
type InterpolatorCache = Map<string, InterpolatorCacheEntry>;

class Interpolator {
    /** @description
     * a RegExp to detect any key to interpolat in the header format (by the used protocol).
     */
    protected keyDetectionRegExp: RegExp;

    /** @description
     * the prefix length 'keyDetectionRegExp' is catch with the tageted key.
     * the amount of charecter needed to be sliced from the key 'keyDetectionRegExp' catching.
     */
    protected keyPrefixLength: number;

    /** @description
     * to improve perfoemence and save pricy interpolation (format analyzing) actions,
     * this map will function as a cache for format analyzing results.
     */
    private textAnalyzerCache: InterpolatorCache;

    constructor(keyDetection: RegExp, keyPrefixLength: number) {
        this.keyDetectionRegExp =  keyDetection;
        this.keyPrefixLength = keyPrefixLength;
        this.textAnalyzerCache = new Map();
    }


    public interpolation(target: { [key: string]: string }, text: string) {
        let targetKeys: string[], normalizedText: string;
        if(this.textAnalyzerCache.has(text)) { // data is in cache 
            const entry = this.textAnalyzerCache.get(text);
            targetKeys = entry.targetKeys;
            normalizedText = entry.normalizedText;
        } else {
            // find the keys in the format & sliceing the '%' from their start.
            targetKeys = this.scanTargetKey(text);
            // replacing the keys position with '$s' for util.format 
            normalizedText = text.replace(this.keyDetectionRegExp, '%s');
            this.textAnalyzerCache.set(text, {text, targetKeys, normalizedText});
        }

        // inject data to the normalizeTextFormat. 
        const interpolatedText = this.injectTargetDataToNormalizeText(targetKeys, target, normalizedText);
        return interpolatedText;
    }

    private scanTargetKey(text: string): string[] {
        const targetKeys = text
            .match(this.keyDetectionRegExp)
            .map((key) => key.slice(this.keyPrefixLength));

        return targetKeys;
    }
 
    private injectTargetDataToNormalizeText(detectedTargetKey: string[], target: { [key: string]: string }, normalizedText: string): string {
        const dataToInterpolate = detectedTargetKey.map((key) => target[key] || '');
        const interpolatedText = format(normalizedText, ...dataToInterpolate);
        return interpolatedText;
    }

}
