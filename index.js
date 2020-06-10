'use strict';

const path = require('path');
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const dotenvShell = require('dotenv-shell');

module.exports = class ServerlessPlugin {
    /**
     *
     * @param {Serverless} serverless Serverless object.
     * @param {*} options Options object.
     */
    constructor(serverless, options = {}) {
        this.serverless = serverless;
        this.options = options;
        this.commands = {};
        this.config = ((serverless.service || {}).custom || {}).setenv || {};
        this.dotenvConfig = { parsed: {} };
        this.processDotEnv();
        this.setEnvVars();
    }

    /**
     * Send a log message via the Serverless Framework.
     * @param {any} msg
     */
    log(msg) {
        this.serverless.cli.log(`setenv: ${msg}`);
    }

    /**
     * Throw an error via the Serverless Framework.
     * @param {any} msg
     */
    throwError(msg) {
        throw new this.serverless.classes.Error(`setenv: ${msg}`);
    }

    /**
     * Process the dotenv configuration
     */
    processDotEnv() {
        const { dirPath, shell, expand, order } = this.config.dotenv || {};
        const dotenvPath = this.getDotenvPath(dirPath);
        try {
            const dotenvConfig = dotenv.config({ path: dotenvPath });
            this.dotenvConfig.parsed = Object.assign(
                this.dotenvConfig.parsed,
                dotenvConfig.parsed,
            );
            this.log(`Loaded dotenv from "${path.relative('.', dotenvPath)}"`);
        } catch (e) {
            this.throwError(e.message);
        }

        if (shell && expand) {
            if (!order || !Array.isArray(order)) {
                this.throwError(`custom.setenv.dotenv.order must be an array`);
            } else if (order.length !== 2) {
                this.throwError(
                    `custom.setenv.dotenv.order must have two items`,
                );
            }
            if (order.join(',') === 'shell,expand') {
                this.dotenvConfig = dotenvExpand(
                    dotenvShell(this.dotenvConfig),
                );
            } else if (order.join(',') === 'expand,shell') {
                this.dotenvConfig = dotenvShell(
                    dotenvExpand(this.dotenvConfig),
                );
            } else {
                this.throwError(
                    `custom.setenv.dotenv.order has an invalid order`,
                );
            }
        } else if (shell) {
            dotenvShell(this.dotenvConfig);
        } else if (expand) {
            dotenvExpand(this.dotenvConfig);
        }
    }

    /**
     * Determines the dotenv path.
     * @param {string} dirPath
     * @return {string} dotenv path
     */
    getDotenvPath(dirPath) {
        if (dirPath && typeof dirPath !== 'string') {
            this.throwError(`custom.setenv.dotenv.dirPath must be a string`);
        }
        const dotenvPath = dirPath ?
            path.resolve(dirPath, '.env') :
            path.resolve('.env');
        const stage =
            process.env.NODE_ENV ||
            process.env.STAGE ||
            process.env.stage ||
            this.options.stage ||
            this.options.env ||
            'dev';
        const dotenvStagePath = `${dotenvPath}.${stage}`;
        if (this.serverless.utils.fileExistsSync(dotenvStagePath)) {
            return dotenvStagePath;
        } else if (this.serverless.utils.fileExistsSync(dotenvPath)) {
            return dotenvPath;
        } else {
            this.throwError(`Could not determine path for .env`);
        }
    }

    /**
     * Update process.env.
     */
    setEnvVars() {
        const { SLS_DEBUG } = process.env;
        try {
            const envVars = this.dotenvConfig.parsed;
            Object.entries(envVars).forEach(([varName, val]) => {
                process.env[varName] = val;
                let logOutput = `Set process.env.${varName}`;
                if (SLS_DEBUG) {
                    logOutput += ` = ${val}`;
                }
                this.log(logOutput);
            });
        } catch (e) {
            this.throwError(e.message);
        }
    }
};
