/** @author Ofir G.
 */

class EnvConfig {

    private env = process.env.NODE_ENV || 'dev';

    constructor() {
        this.assignConfig();
    }

    private assignConfig() {
        if (this.env === 'dev' || this.env === 'test') {
            const config = require('./config.json');
            const envConfig = config[this.env];
            Object.keys(envConfig).forEach((key) => {
                process.env[key] = envConfig[key];
            });
        }
    }
}

export const setup = new EnvConfig();
