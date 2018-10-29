/** 
 * @module Simple-Logger
 * @author Genish Ofir 
 * @license ISC License 
 * @requires [colors/safe,json-stringify-safe] - (dependencies packages)
 * @description  simple & light logger service.
 */

import { LoggerExpressExtension } from '../logger-engine-extension/logger-expresse-extension';
import { AbstractRecordStringifierPlugin, AbstractRecordTransformerPlugin, 
         AbstractRecordStreamerPlugin, AbstractRecordFactoryPlugin } from "../logger-engine-plugin";
import { LogRecord, LogLevelSettingEntry,  LoggerEngineOptions, LogLevelsSetting } from "../models";
import { LeggerExpressConfig } from '../models/logger-express-config.model';
import { AbstractLoggerEngine } from '../models/abstract-logger-engine.model';


// #region - LoggerEngine class 
export class LoggerEngine<L> extends AbstractLoggerEngine<L> {

    protected logLevels: Array<keyof L>;
    protected logLevelsSetting: LogLevelsSetting<L>;
    protected options: LoggerEngineOptions<L>;
    
    // #region --- engine plugins
    protected factory: AbstractRecordFactoryPlugin
    protected stringifier: AbstractRecordStringifierPlugin;
    protected transformer: AbstractRecordTransformerPlugin;
    protected streamer: AbstractRecordStreamerPlugin;
    // #endregion

    protected expressExt: LoggerExpressExtension;
    
    constructor(logLevels: Array<keyof L>, options: LoggerEngineOptions<L>) {
        super();
        this.logLevels = logLevels;
        this.options = options;
        this.logLevelsSetting = new Map(options.logLevelsSettingTable);

        this.streamer = options.plugins.steramer;
        this.stringifier = options.plugins.stringifier;
        this.transformer = options.plugins.transformer;
        this.factory = options.plugins.factory;

        this.expressExt = new LoggerExpressExtension();
    }

    // #region - public - silence logs 
    public silence(level: keyof L): void {
        this.logLevelsSetting.get(level).silenced = true;
    }
    public silenceALL(): void {
        this.logLevelsSetting.forEach((levelSetting) => levelSetting.silenced = true);
    }
    public silenceALLBut(levels: Array<keyof L>) {
        this.logLevelsSetting.forEach((levelSetting, level) => {
            if (!levels.some(lvl => lvl === level)) {
                levelSetting.silenced = true
            }
        });
    }
    // #endregion

    // #region - express ext.
    public middleExpress(config: Partial<LeggerExpressConfig>) {
        return this.expressExt.getMiddleware(config, { 
            engineStarter: (this.starter).bind(this),
            logLevelsSetting: this.logLevelsSetting,
        })
    }
    // #endregion

    // #region - protected - processing   
    protected processLogRequest(level: keyof L, record: { message: string, params?: any } | string) {
        if(!this.logLevelsSetting.has(level)) { return; }
        const levelSetting = this.logLevelsSetting.get(level);
        this.starter(level as string, levelSetting, record);
    }
 
    protected starter(levelName: string, setting: LogLevelSettingEntry, record: { message: string, params?: any } | string) {
        if (setting.silencedOnEnv.some(env => env == process.env.NODE_ENV)) { return; }
        if (setting.silenced) { return; }
  
        /** record creation **/
        const { includeKeys, filterKeys} = setting;
        const logRecord: LogRecord = (typeof record === 'string') ?
            this.factory.create(this.options.appName, levelName, record, undefined, { includeKeys, filterKeys}) :
            this.factory.create(this.options.appName, levelName, record.message, record.params, { includeKeys, filterKeys});

        /** record stringify **/
        const {recordHeadFormat, replacers} = setting;
        const stringifiedRecord = this.stringifier.stringify(logRecord, recordHeadFormat, replacers);
        
        /** conditions pre-transformetion **/
        const { maxRecoredLength } = setting;
        if (maxRecoredLength > 0 
            && maxRecoredLength < stringifiedRecord.body.length + stringifiedRecord.head.length) { return; }
        /** record transform **/
        const { recordTransformations } = setting;
        const transformedRecord = this.transformer.transform(stringifiedRecord, recordTransformations)
       
        /** conditions pre-stream-writing **/
        if (maxRecoredLength > 0 
            && maxRecoredLength < transformedRecord.body.length + transformedRecord.head.length) { return; }
        /** record stream write **/
        this.streamer.write(transformedRecord, setting.writeStream);
    }
    
    protected onExit() {
        process.on('exit', function () {
            console.log('About to exit.');
            // TODO : close all stream
        });
    }
    // #endregion
}


