'use strict';

const ServerlessPlugin = require('./index');
const { existsSync: fileExistsSync } = require('fs');

describe('plugin', () => {
    let serverless = {};
    beforeEach(() => {
        // clear environment
        process.env = {};
        serverless = {
            service: {},
            classes: {
                Error,
            },
            cli: {
                log: console.log,
            },
            utils: {
                fileExistsSync,
            },
        };
    });
    test('dotenv file missing', () => {
        expect(() => new ServerlessPlugin(serverless)).toThrowError(
            'setenv: Could not determine path for .env',
        );
    });
    test('basic dotenv with env', () => {
        process.env.STAGE = 'test';
        new ServerlessPlugin(serverless);
        expect(process.env).toEqual({
            STAGE: 'test',
            BASIC: 'basic',
            EXPAND: '${BASIC}',
            SHELL: '`echo basic`',
            EXPAND_SHELL: '`echo \'${EXPAND}\'`',
        });
    });
    test('basic dotenv with dirPath and no env', () => {
        serverless.service.custom = { setenv: { dotenv: { dirPath: 'test' } } };
        new ServerlessPlugin(serverless);
        expect(process.env).toEqual({
            BASIC: 'basic',
            EXPAND: '${BASIC}',
            SHELL: '`echo basic`',
            EXPAND_SHELL: '`echo \'${EXPAND}\'`',
        });
    });
    test('dotenv expand', () => {
        process.env.STAGE = 'test';
        serverless.service.custom = { setenv: { dotenv: { expand: true } } };
        new ServerlessPlugin(serverless);
        expect(process.env).toEqual({
            STAGE: 'test',
            BASIC: 'basic',
            EXPAND: 'basic',
            SHELL: '`echo basic`',
            EXPAND_SHELL: '`echo \'basic\'`',
        });
    });
    test('dotenv shell', () => {
        process.env.STAGE = 'test';
        serverless.service.custom = { setenv: { dotenv: { shell: true } } };
        new ServerlessPlugin(serverless);
        expect(process.env).toEqual({
            STAGE: 'test',
            BASIC: 'basic',
            EXPAND: '${BASIC}',
            SHELL: 'basic',
            EXPAND_SHELL: '${EXPAND}',
        });
    });
    describe('dotenv expand and shell', () => {
        test('no order', () => {
            process.env.STAGE = 'test';
            serverless.service.custom = {
                setenv: { dotenv: { expand: true, shell: true } },
            };
            const errMsg =
                'setenv: custom.setenv.dotenv.order must be an array';
            expect(() => new ServerlessPlugin(serverless)).toThrowError(errMsg);
        });
        test('expand first', () => {
            process.env.STAGE = 'test';
            serverless.service.custom = {
                setenv: {
                    dotenv: {
                        expand: true,
                        shell: true,
                        order: ['expand', 'shell'],
                    },
                },
            };
            new ServerlessPlugin(serverless);
            expect(process.env).toEqual({
                STAGE: 'test',
                BASIC: 'basic',
                EXPAND: 'basic',
                SHELL: 'basic',
                EXPAND_SHELL: 'basic',
            });
        });
        test('shell first', () => {
            process.env.STAGE = 'test';
            serverless.service.custom = {
                setenv: {
                    dotenv: {
                        expand: true,
                        shell: true,
                        order: ['shell', 'expand'],
                    },
                },
            };
            new ServerlessPlugin(serverless);
            expect(process.env).toEqual({
                STAGE: 'test',
                BASIC: 'basic',
                EXPAND: 'basic',
                SHELL: 'basic',
                EXPAND_SHELL: 'basic',
            });
        });
    });
});
