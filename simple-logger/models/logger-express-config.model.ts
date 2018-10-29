
export type ExpressRequestProperties = ( 
    'xhr' | 'query'   | 'protocol'   | 'body' | 'method' | 'stale' | 'signedCoockies' |
    'ip'  | 'cookies' | 'hostname'   | 'path' | 'secure' | 'route' | 'originalUrl'    |
    'ips' | 'baseUrl' | 'subdomains' | 'app'  | 'params' | 'fresh' 
);
export type ExpressResponseProperties = ('app' | 'headersSent' | 'locals');
export type ExpressErrorProperties = string;
export interface LeggerExpressParameterConfig<KEYS> {
    usedLevel: string,
    usedOnPath?: {method: string, path: string}[],
    filterKeys?: string[],
    includeKeys?: Array<KEYS>, // properties of - Express.Response / Express.Request / any 
}
export type LeggerExpressResponseConfig = LeggerExpressParameterConfig<ExpressResponseProperties>;
export type LeggerExpressRequestConfig  = LeggerExpressParameterConfig<ExpressRequestProperties>;
export type LeggerExpressErrorConfig = LeggerExpressParameterConfig<ExpressErrorProperties>


export interface LeggerExpressConfig {
    res: LeggerExpressResponseConfig,
    req: LeggerExpressRequestConfig,
    err: LeggerExpressErrorConfig,
}
