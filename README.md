```
  _____           __  _____ _               _
 |  __ \         / _|/ ____| |             | |
 | |__) |__ _ __| |_| |    | |__   ___  ___| | __
 |  ___/ _ \ '__|  _| |    | '_ \ / _ \/ __| |/ /
 | |  |  __/ |  | | | |____| | | |  __/ (__|   <
 |_|   \___|_|  |_|  \_____|_| |_|\___|\___|_|\_\

```
- [Intro](#intro)
- [Install](#install)
- [Config](#config)
  * [`./config/config.json`](#--config-configjson-)
    + [Parameters](#parameters)
      - [Sample file:](#sample-file-)
  * [`./config/pages.json`](#--config-pagesjson-)
    + [Parameters](#parameters-1)
      - [Sample file:](#sample-file--1)
  * [`./rules/*`](#--rules---)
    + [`./rules/rules.js`](#--rules-rulesjs-)
    + [Creating a new rule](#creating-a-new-rule)
- [Getting the HARs](#getting-the-hars)
  * [`gethar` CLI Options](#-gethar--cli-options)
- [Checking a HAR file.](#checking-a-har-file)
  * [`xray` CLI Options](#-xray--cli-options)
- [Checking multiple HAR files.](#checking-multiple-har-files)
  * [`perfcheck` CLI Options](#-perfcheck--cli-options)


# Intro

This is a customizable performance check based on [pagexray](https://github.com/sitespeedio/pagexray) from [sidespeed.io](https://github.com/sitespeedio/pagexray). It has 3 main apps:

1. [gethar](#getting-the-hars): Downloads HAR files from a list of URLs using [Puppetteer](https://github.com/GoogleChrome/puppeteer). Used when you want to download HAR files of several pages / screen sizes.
2. [xray](#checking-a-har-file): Checks the performance of a single HAR file against your own set of rules.
3. [perfcheck](#checking-multiple-har-files): Checks the performance of an entire folder, captured by `gethar` and shows a report.

# Install

Clone this repository and run:

```
$ npm install
```

# Config

## `./config/config.json`

Main configuration file.

### Parameters

 - `harFolder` <[string]> Destination folder for the HAR files. _Default_ __```har-files```__
 - `autoScroll` <[Boolean]> Option for Puppeteer to scroll automatically to the bottom of the page before screenshot. Useful for scroll incrementally through a page in order to deal with lazy loaded elements. It scrolls in 100px every 100ms until the bottom of the page. _Default_ __```true```__
  - `pages` <[string]> Path and file name of pages list. _Default_ __```./config/pages.json```__
  - `puppeteer` <[Object]> <[Puppeteer]> config object. _Default_:
  	- `launch` <[boolean]> Whether to use or not the headless mode. _Default_ __```true```__
  	- `emulate` <[Array]> Array of objects following the Puppeteer [`DeviceDescriptors.js`](https://github.com/GoogleChrome/puppeteer/blob/master/DeviceDescriptors.js) standards. In order to test different resolutions emulating the same browser, just add the width in the `name` parameter. E.g.: `"name": "Chrome 1024"`.

#### Sample file:

```
{
	"harFolder": "har-files",
	"autoScroll": true,
	"pages": "./config/pages.json",
	"puppeteer": {
		"launch": {
			"headless": true
		},
		"emulate": [
			{
				"name": "Chrome 1280",
				"userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36",
				"viewport": {
					"width": 1280,
					"height": 780
				}
			},
			{
				"name": "iPhone 6",
				"userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1",
				"viewport": {
					"width": 375,
					"height": 667,
					"deviceScaleFactor": 1,
					"isMobile": true,
					"hasTouch": true,
					"isLandscape": false
				}
			}
		]
	}
}
```

## `./config/pages.json`

Pages and actions to be performed.

### Parameters

 - `domain` <[string]> Main domain to be tested. It is concatenated with the `pages.url`.
 - `authenticate` <[Object]> Object credentials for [http authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication). See more at [Puppeteer page.authenticate](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pageauthenticatecredentials) documentation. If `username` or `password` equal to `null`, will not run the `page.authenticate` method.
 	- `username` <[string]> _Default_ __```null```__
 	- `password` <[string]> _Default_ __```null```__
 - `pages` <[Array]> Array of objects containing information about the pages to be tested.
	- `url` <[string]> URL path. It is also used to create a unique filename for each image so, it is important to have a unique `url` name. If you want to test mutiple scenarios from the same page, use some `querystring` to identify it otherwise the last file will override the previous one.
	- `click` <[array]> Array of elements to be clicked. Each element is a [selector] to search for element to click. If there are multiple elements satisfying the selector, the first will be clicked. It follows the same behavior of the `document.querySelectorAll` of javascript.
	- `waitFor` If follows the [Puppeteer] __[`page.waitFor`](https://github.com/GoogleChrome/puppeteer/blob/v1.2.0/docs/api.md#pagewaitforselectororfunctionortimeout-options-args)__ documentation.

Actions will follow the order:

```
 Page load event → autoScroll → click → waitFor → get HAR
```

#### Sample file:

```
{
	"domain": "http://www.yoursupercoolsite.com",
	"authenticate": {
		"username": null,
		"password": null
	},
	"pages": [
		{ "url": "/", "click": ["#mainbutton"]},
		{ "url": "/?complex-selector", "click": [".menu-secondary > ul > li:nth-child(2) > .link"]},
		{ "url": "/?3-buttons", "click": ["#firstbutton", ".secondbutton", "#send-form a"]},
		{ "url": "/?click-and-wait", "click": ["#mainbutton"], "waitFor": 5000},
		{ "url": "/contact"},
		{ "url": "/products"},
		{ "url": "/products/product-1"},
		{ "url": "/products/product-2"},
		{ "url": "/products/product-3"}
	]
}
```

## `./rules/*`

Yor set of rules are in the `./rules` folder. You can config the set of rules inside `./rules/rules.js` file. Eg.:

### `./rules/rules.js`
```
module.exports = [
	require('../rules/statusOk.js'),
	require('../rules/assetsStatusOk.js'),
	require('../rules/lightImages.js'),
	require('../rules/cdn.js'),
	require('../rules/noAdminAjax.js'),
];
```

### Creating a new rule

In order to reate a new rule:

1. Duplicate the `./rules/_sampleRule.js`
2. Do your magic
3. Add it to the `./rules/rules.js` file

The performance check will follow the Array order.

# Getting the HARs

```
$ node gethar
```

Downloads the HAR files inside the destination folder. It will use the `emulate.name` to create a folder for each "device". E.g.:

```
./har-files/2019.11.11-16.34.929/
              ├── chrome-1280/
              ├── chrome-1024/
              ├── iphone-6/
              ...
```

## `gethar` CLI Options

```
Get Har

  Get HAR files from several pages of the same domain

Usage

  $ node gethar <options>

  $ node gethar --help

  $ node gethar --loglevel 1 --headless false --pages anotherfile.json --domain
  http://www.myanotherdomain.com --auth myuser:MyP4ssw0rd


Options List

  -h, --help string          Print out helpful information.
  -l, --loglevel number      Log level. Default 0
                             0=Silent, 1=Important only, 2=All.
  -d, --domain string        Main domain to be tested. When set, it OVERRIDES the "domain" parameter from
                             the ./config/pages.json file.
  -a, --auth string:string   username:password for the http authentication. When set, it OVERRIDES the
                             "authenticate" parameter from the ./config/pages.json file.
  -e, --headless boolean     Set Puppeteer to run in the headless mode. When set, it OVERRIDES the
                             "headless" parameter from the ./config/config.json file.
  -p, --pages string         The path to the pages.json file. Default option uses ./config/pages.json from
                             the root of the project.

```

# Checking a HAR file.

```
$ node xray --har ./path/to/your/harfile.har
```

Run your rules against a single HAR file.

## `xray` CLI Options

```
Performance XRay

  Run your own performance check based on a HAR file.

Usage

  $ node xray <options>

  $ node xray --har ./path/to/your/harfile.har

  $ node xray --loglevel 2 --har ./path/to/your/harfile.har


Options List

  -h, --help string       Print out helpful information.
  --har string            Path of your HAR file.
  -l, --loglevel number   Log level. Default 0
                          0=Silent, 1=Important only, 2=All.
```

# Checking multiple HAR files.

```
$ node perfcheck --harfolder ./har-files/FOLDER/
```

Run your rules against a collection of HAR files. You must point to the "parent folder" and `perfcheck` will recursively check the HAR files inside the defined `device name` folders. E.g.:

```
$ node perfcheck --harfolder ./har-files/2019.11.11-16.34.929/
```

It will run the performance check for the files inside the `chrome-1280/`, `chrome-1024` and `iphone-6` folders.

```
./har-files/2019.11.11-16.34.929/ 👈 Parent folder
              ├── chrome-1280/ ← device name
              ├── chrome-1024/ ← device name
              ├── iphone-6/ ← device name
```

## `perfcheck` CLI Options

```
Perf Check

  Run your own performance check based on a collection of HAR files inside a
  folder

Usage

  $ node perfcheck <options>

  $ node perfcheck --harfolder ./har-files/2019.11.06-17.09.312/

  $ node perfcheck --loglevel 2 --harfolder ./har-files/2019.11.06-17.09.312/


Options List

  -h, --help string        Print out helpful information.
  -f, --harfolder string   Path to the HAR folder used as the base for the performance check.
  -l, --loglevel number    Log level. Default 0
                           0=Silent, 1=Important only, 2=All.
```

[Array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array "Array"
[boolean]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type "Boolean"
[function]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function "Function"
[number]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type "Number"
[Object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object "Object"
[string]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type "String"
[Puppeteer]: https://github.com/GoogleChrome/puppeteer "Puppeteer"
[Resemblejs]: https://github.com/HuddleEng/Resemble.js "Resemblejs"
[selector]: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors "selector"

