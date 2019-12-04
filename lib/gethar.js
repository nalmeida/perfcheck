const puppeteer = require('puppeteer');
const PuppeteerHar = require('puppeteer-har');

const util = require('./util/util.js');
	const timeStamp = util.timeStamp;
	const mkdir = util.mkdir;
	const readJSON = util.readJSON;
	const banner = util.banner;
	const log = util.log;
	const toHHMMSS = util.toHHMMSS;
	const filenamify = util.filenamify;
	const newLogRow = util.newLogRow;
	// const updateLogRow = util.updateLogRow;
	const endLogRow = util.endLogRow;
	const findDuplicates = util.findDuplicates;

var config;
var authenticateUser;
var authenticatePass;
var pages;
var logLevel;
var urlsToTest;
var autoScroll;
var domainConfig;
var headlessConfig;
var pagesConfig;
var authConfig;

module.exports = function(commandLineObject){

	util.logLevel = logLevel = (commandLineObject.loglevel === undefined) ? 2 : commandLineObject.loglevel;

	var configFile = commandLineObject.config || './config/config.json';
		domainConfig = commandLineObject.domain || undefined;
		headlessConfig = commandLineObject.headless || undefined;
		authConfig = commandLineObject.auth || undefined;
		pagesConfig = commandLineObject.pages || undefined;


	config = readJSON(configFile);
		autoScroll = config.autoScroll;

	if(pagesConfig != undefined) {
		config.pages = pagesConfig;
	}

	pages = readJSON(config.pages);
		urlsToTest = pages.pages;
		authenticateUser = pages.authenticate.username
		authenticatePass = pages.authenticate.password

	if(domainConfig != undefined) {
		pages.domain = domainConfig;
	}
	if(headlessConfig != undefined) {
		if(headlessConfig.toLowerCase() === 'false') headlessConfig = false;
		else if(headlessConfig.toLowerCase() === 'true') headlessConfig = true;

		config.puppeteer.launch.headless = headlessConfig;
	}
	if(authConfig != undefined) {
		authenticateUser = authConfig.split(':')[0];
		authenticatePass = authConfig.split(':')[1];
	}

	var tmpArr = [];

	for (var i = 0; i < urlsToTest.length; i++) {
		tmpArr.push(urlsToTest[i].url)
	}

	var duplicateUrl = findDuplicates(tmpArr);
	if(duplicateUrl.length > 0) {
		console.error('Error: duplicate url found.\n' + (duplicateUrl.join('\r\n')));
		process.exit(1);
	}

	if(logLevel == 2) {
		banner('Capturing HAR');
	}
	mkdir(config.harFolder);

	captureHar();
}

var startTime = new Date();

const scrollToBottom = function(page){
	// from: https://github.com/GoogleChrome/puppeteer/issues/844#issuecomment-338916722
	return page.evaluate(() => {
		return new Promise((resolve, reject) => {
			var totalHeight = 0;
			var distance = 100;
			var timer = setInterval(() => {
				var scrollHeight = document.body.scrollHeight;
				window.scrollBy(0, distance);
				totalHeight += distance;

				if(totalHeight >= scrollHeight){
					window.scrollBy(0, 0);
					clearInterval(timer);
					resolve();
				}
			}, 100);
		})
	});
}

const captureHar = async () => {

	var harFolder = config.harFolder + '/' + timeStamp();

	mkdir(harFolder);
	if(logLevel == 2) {
		log('Creating "' + harFolder + '" folder\n');
	}

	var lineCount = 0;

	for (var i=0; i < urlsToTest.length; i++) {



		var slug = urlsToTest[i].url;
		var fullUrl = pages.domain + slug;
		var click = pages.pages[i].click;
		var waitFor = pages.pages[i].waitFor;
		var devicesToEmulate = config.puppeteer.emulate;

		var consoleMessages = []

		for (device in devicesToEmulate) {

			try {
				var browser = await puppeteer.launch(config.puppeteer.launch)
			} catch(e) {
				console.error('\n Error: puppeteer.launch\n', e);
			}

			try {
				var page = await browser.newPage();
				var har = new PuppeteerHar(page);
			} catch(e) {
				console.error('\n Error: browser.newPage\n', e);
			}
				if(authenticateUser != null && authenticatePass != null) {
					page.authenticate({username:authenticateUser, password: authenticatePass})
				}

			lineCount++;

			var now = (util.logLevel == 1 ? '\t': '') + util.time();
			var fileName = i + '_' + filenamify(slug);
			var deviceFolder = harFolder + '/' + filenamify(devicesToEmulate[device].name.toLowerCase().replace(/ /g,'-'));
			var file = `${deviceFolder}/${fileName}.har`;

			if(logLevel == 2) {
				log('URL:\t' + fullUrl);
			} else if(logLevel == 1) {
				newLogRow(now + '\t' + fullUrl)	;
			}

			try {
				await page.emulate(devicesToEmulate[device]);
			} catch(e) {
				console.error('\n Error: page.emulate\n', e);
			}

			//page.on('console', message => consoleMessages.push({type: message.type(), message: message.text()}));

			await har.start({ path: file });
			    
			try {
				await page.goto(fullUrl);
			} catch(e) {
				console.error('\n Error: page.goto\n', e);
			}

			if(autoScroll) {
				try {
					await scrollToBottom(page);
				} catch(e) {
					console.error('\n Error: scrollToBottom\n', e);
				}

			}

			if(click) {
				for (selector in click) {
					try {
						await page.click(click[selector]);
					} catch(e) {
						console.error('\n Error: page.click\n', e);
					}
				}
			}
			if(waitFor) {
				try {
					await page.waitFor(waitFor);
				} catch(e) {
					console.error('\n Error: page.waitFor\n', e);
				}
			}

			try {
				await page.mouse.move(0,0);
			} catch(e) {
				console.error('\n Error: page.mouse.move\n', e);
			}

			mkdir(deviceFolder);
			try {
				await har.stop();

			} catch(e) {
				console.error('\n Error: har.stop\n', e);
			}

			if(logLevel == 2) {
				log('HAR:\t' + file);
			}

			if(logLevel == 1) {
				endLogRow(now + '\t' + fullUrl + '\t' + file, lineCount);  
			}

			try {
				await browser.close();
			} catch(e) {
				console.log('\n Error: browser.close\n', e);
			}

		}


	}


	if(logLevel == 2) {
		var timeDiff = ((new Date()) - startTime) / 1000;
		banner('Proccess finished. Elapsed time: ' + toHHMMSS(timeDiff));
		log('Files saved at: ' + harFolder + '\n')
	}

}
