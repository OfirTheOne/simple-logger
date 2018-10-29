/** 
 * @module Simple-Logger
 * @author Genish Ofir 
 * @license ISC License 
 * @requires [colors/safe,json-stringify-safe] - (dependencies packages)
 * @description  simple & light logger service.
 */

import { FlatLogRecord, LogRecordTransformations } from "../models";

export abstract class AbstractRecordTransformerPlugin {
    public abstract transform(flatRecord: FlatLogRecord, recordTransformations: LogRecordTransformations): FlatLogRecord;
}
export class RecordTransformerPlugin implements AbstractRecordTransformerPlugin {

    private safeTransformation = (myString, transform) => {
        let transformResult: string = undefined; 
        try { transformResult = transform(myString); } catch (error) {}
        return transformResult || myString;
    }
    private unsafeTransformation = (myString, transform) => transform(myString);
    
    constructor() { }

    public transform(flatRecord: FlatLogRecord, recordTransformations: LogRecordTransformations): FlatLogRecord {
        const transformedHead = this.applayTransformations(recordTransformations.head, flatRecord.head);
        const transformedBody = this.applayTransformations(recordTransformations.body, flatRecord.body);
        return { head: transformedHead, body: transformedBody }
    }

    // #region - internal
    protected applayTransformations(transformations: ((str: string) => string)[], str: string) {
        const safe = true;
        const transformedString =
            transformations.reduce(safe? this.safeTransformation : this.unsafeTransformation, str);
        return transformedString;
    }
    // #endregion
}