import { LoggerEnginePlugins } from './models/logger-engine-options.model';
/** 
 * @module Simple-Logger
 * @author Genish Ofir 
 * @license ISC License 
 * @requires [colors/safe,json-stringify-safe] - (dependencies packages)
 * @description  simple & light logger service.
 */


import { LoggerEngineOptions, LogLevelMethod, SimpleLogLevel, LogLevelsSettingTable } from './models';
import { LoggerEngine } from './logger-engine/logger-engine';
import { DEFAULT_LOG_LEVALS_ARRAY, DEFAULT_ENGINE_OPTIONS } from './default-values/default';
import { RecordStreamerPlugin, RecordTransformerPlugin, RecordStringifierPlugin, RecordFactoryPlugin } from './logger-engine-plugin';

type SimpleLogger<T> = { [key in keyof T]: LogLevelMethod } & LoggerEngine<T>;

export class LoggerFactory {

    private static loggerSingleRef: SimpleLogger<any>;

    /** @returns the default logger with default log levels and options
     * */
    public static create(): SimpleLogger<SimpleLogLevel>
    /** @returns a logger with 'SimpleLogLevel' levels and injected options
     * */
    public static create(options: Partial<LoggerEngineOptions<SimpleLogLevel>>): SimpleLogger<SimpleLogLevel>
    /** @returns a custom logger with injected log levels and options
     * */
    public static create<T>(logLevels: Array<keyof T>, options: LoggerEngineOptions<T>): SimpleLogger<T>

    public static create<T = SimpleLogLevel>(
        logLevelsOrOptions?: Array<keyof T> | Partial<LoggerEngineOptions<T | SimpleLogLevel>>,
        optionsOptional?: LoggerEngineOptions<T>): SimpleLogger<T | SimpleLogLevel> {
        // loggerSingleRef not defined before / create method have not been called

        if (!this.loggerSingleRef) {
            // --- case 01 - 0 argument
            // using the : default log-levels, default engine options, default engine plugins 
            // ---
            if (arguments.length === 0) {
                // const options = Object.assign(DEFAULT_ENGINE_OPTIONS, {
                //     plugins: this.constructEnginPlugins(DEFAULT_ENGINE_OPTIONS)
                // });
                const options = DEFAULT_ENGINE_OPTIONS;
                options.plugins = this.constructEnginPlugins(options);
                this.loggerSingleRef = this.plugLevelsInEngine<SimpleLogLevel>(
                    DEFAULT_LOG_LEVALS_ARRAY,
                    options
                ) as SimpleLogger<SimpleLogLevel>;
            }

            // --- case 02 - 1 argument
            // using the : default log-levels, provided engine options, default engine plugins 
            // ---
            else if (isPartialEngineOptions<T>(logLevelsOrOptions) && arguments.length === 1) {

                // const usedSetting = 
                //     logLevelsOrOptions.logLevelsSettingTable ? 
                //         this.margeLogLevelsSetting(
                //             logLevelsOrOptions.logLevelsSettingTable, 
                //             DEFAULT_ENGINE_OPTIONS.logLevelsSettingTable) 
                //         : DEFAULT_ENGINE_OPTIONS.logLevelsSettingTable;
                    
                // marge the partial options with the default options
                const options: LoggerEngineOptions<SimpleLogLevel> = 
                    Object.assign(DEFAULT_ENGINE_OPTIONS, logLevelsOrOptions);


                options.logLevelsSettingTable = this.margeLogLevelsSetting(
                    options.logLevelsSettingTable,
                    DEFAULT_ENGINE_OPTIONS.logLevelsSettingTable
                )

                options.plugins = this.constructEnginPlugins(options);
                this.loggerSingleRef = this.plugLevelsInEngine<SimpleLogLevel>(
                    DEFAULT_LOG_LEVALS_ARRAY,
                    options
                ) as SimpleLogger<SimpleLogLevel>;
            }

            // --- case 03 - 2 argument
            // using the : provided log-levels, provided engine options, default engine plugins
            // ---
            else if (isLogLevelsArray<T>(logLevelsOrOptions) && isEngineOptions<T>(optionsOptional) && arguments.length === 2) {
                const logLevels = logLevelsOrOptions;
                if (!isLogLevelsValidName(logLevels as string[])) {
                    throw 'Invalid log level name.'
                } else {
                    const options = Object.assign(
                        optionsOptional, { plugins: this.constructEnginPlugins(optionsOptional) }
                    );
                    this.loggerSingleRef = this.plugLevelsInEngine<T>(
                        logLevels,
                        options
                    ) as SimpleLogger<T>;
                }
            }
        }
        return this.loggerSingleRef as SimpleLogger<T | SimpleLogLevel>;
    }

    private static plugLevelsInEngine<P>(logLevels: Array<keyof P>, options: LoggerEngineOptions<P>) {
        type enginePlugType = P;
        const engine = new LoggerEngine<enginePlugType>(logLevels, options);
        // type define the engine plug fields
        const dynamicLogLevelsPlug = engine as (LoggerEngine<P> & { [key in keyof enginePlugType]: LogLevelMethod });
        // attach method to each level field and bind it to engine instance
        for (const level of logLevels) {
            const boundMethod: LogLevelMethod = (
                (function (record: { msg: string, params?: any } | string) {
                    this.processLogRequest(level, record);
                })
                    .bind(engine)
            );
            dynamicLogLevelsPlug[level] = boundMethod;
        }
        // combine the plug and the engine to a new logger instance
        // dynamicLogLevelsPlug
        const simpleLogger = dynamicLogLevelsPlug // Object.assign(dynamicLogLevelsPlug, engine); // Object.setPrototypeOf(dynamicLogLevelsPlug, engine);
        return simpleLogger;
    }

    private static constructEnginPlugins(options: LoggerEngineOptions<any>): LoggerEnginePlugins {
        const enginePlugins = options.plugins || {};
        return {
            steramer: enginePlugins.steramer || new RecordStreamerPlugin(options.logRecordsSpaceing),
            transformer: enginePlugins.transformer || new RecordTransformerPlugin(),
            stringifier: enginePlugins.stringifier || new RecordStringifierPlugin(),
            factory: enginePlugins.factory || new RecordFactoryPlugin(),
        }
    }

    private static margeLogLevelsSetting(
        providedSetting: LogLevelsSettingTable<SimpleLogLevel> = [], 
        defaultSetting: LogLevelsSettingTable<SimpleLogLevel>
    ): LogLevelsSettingTable<SimpleLogLevel> {
        // find levels included in the default-setting a not on the provided-setting
        const missingLevels = defaultSetting
            .filter((defaultLevel) => providedSetting.every(
                providedLevel => providedLevel[0] !== defaultLevel[0]) 
        );
        const margedSetting = providedSetting.concat(missingLevels);
        return margedSetting;
    }
}

// #region - helper methods
/**
 * @description - gaurd for Partial<LoggerEngineOptions<T>>
 */
function isPartialEngineOptions<T>(options): options is Partial<LoggerEngineOptions<T>> {
    return options !== undefined
        && options !== null
        && typeof options === 'object'
        && ((options as object).hasOwnProperty('appName')
            || (options as object).hasOwnProperty('logLevelsSettingTable')
            || (options as object).hasOwnProperty('logRecordsSpaceing'))
}
/**
 * @description - gaurd for LoggerEngineOptions<T>
 */
function isEngineOptions<T>(options): options is LoggerEngineOptions<T> {
    return options !== undefined
        && options !== null
        && typeof options === 'object'
        && (options as object).hasOwnProperty('appName')
        && (options as object).hasOwnProperty('logLevelsSettingTable')
        && (options as object).hasOwnProperty('logRecordsSpaceing')
}
/**
 * @description - gaurd for Array<keyof T>
 */
function isLogLevelsArray<T>(logLevels): logLevels is Array<keyof T> {
    return logLevels !== undefined
        && logLevels !== null
        && Array.isArray(logLevels)
}
/**
 * @description validate that 'logLevels' contains array of string that match JS method name. 
 */
function isLogLevelsValidName(logLevels: string[]): boolean {
    const validMethodNameRegEx = /^[$A-Z_][0-9A-Z_$]*$/i;
    return logLevels.every((level) => {
        return validMethodNameRegEx.test(level);
    })
}
// #endregion