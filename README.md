# Serverless Set Env Plugin

![Push to master](https://github.com/miguel-a-calles-mba/serverless-setenv/workflows/Push%20to%20master/badge.svg?branch=master)

## Table of Contents

1. [Description](#description)
2. [Requirements](#requirements)
3. [Installation](#installation)
4. [Using the Plugin](#using-the-plugin)
5. [Notes](#notes)
6. [License](#license)

## Description

This plugin allow you to call a CLI command to create and remove an AWS Route 53 hosted zone. This plugin is designed for the Serverless Framework 1.x.

## Requirements

- Serverless Framework 1.x.
- Node 10.x or greater.
- NPM 6.x or greater.

## Installation

### Installing the Serverless Framework

Visit the [Getting Started with the Serverless Framework](https://serverless.com/framework/docs/getting-started) to get started with the Serverless Framework.

Install with **npm**:

```sh
npm install -g serverless
```

### Installing the Plugin

Install with **npm**:

```sh
npm install --save-dev serverless-setenv
```

## Using the Plugin

And then add the plugin to your `serverless.yml` file:

```yaml
plugins:
  - serverless-setenv

custom:
  setenv:
```

See the [example(s)](./examples).

### Notes

Please request features or report problems using the [issues](https://github.com/miguel-a-calles-mba/serverless-setenv/issues) page.

## License

See the included [LICENSE](LICENSE) for rights and limitations under the terms of the MIT license.
