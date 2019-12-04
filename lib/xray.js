const fs = require("mz/fs");
const pagexray = require('pagexray');
const util = require('./util/util.js');
	const red = util.red;
	const green = util.green;

// Rules list
const rules = require('../rules/rules.js');

module.exports = function(_harPath, _logLevel, _emulate, _csvFile) {

	var har = JSON.parse(fs.readFileSync(_harPath));
	var logLevel = _logLevel;
	var csvFile = _csvFile;
	var pages = pagexray.convert(har, {pretty: false, includeAssets: true});

	var csvRulesResult = ''
	var harScapedPath = _harPath.replace('!','\\!')

	this.page = {
		url: pages[0].url,
		json: pages[0],
		emulate: _emulate,
		rules: rules,
		resultsArr: [],
		totalErrorCount: 0,
		test: function() {
			for (var j=0; j<this.rules.length; j++) {
				this.rules[j]['rule'](this.json, this.resultsArr);
				csvRulesResult += ';' + this.resultsArr[j].count
			}
			this.resultsArr = this.resultsArr.filter(function(elm) {
				return elm.count > 0;
			});
			for(var i=0; i<this.resultsArr.length; i++) {
				this.totalErrorCount += this.resultsArr[i].count;
			}
			util.csvStr += ((this.totalErrorCount > 0 ? 'error' : 'passed') + ';' + this.emulate + ';' + this.url + ';' + harScapedPath + ';' + this.totalErrorCount +  csvRulesResult) + '\n'
		}
	};

	page.test();

	if(logLevel == 0) {
		if(page.totalErrorCount > 0) {
			process.exit(1);
		}	else {
			process.exit(0);
		}
	}

	// if(csvFile) {
	// 	var csv = '';
	// 	var status = page.totalErrorCount > 0 ? 'error' : 'passed';
	// 	csv += status + ';' + page.url;
	// }

	if(page.totalErrorCount > 0) {

		if(logLevel > 0) {
			console.log(red('✘ [' + page.totalErrorCount + ']') + ' ' + page.url + ' (' + harScapedPath + ')')

			// if(csvFile) {
			// 	csv += ';' + page.totalErrorCount;
			// }
		}
		if(logLevel > 1) {

			var errorsId = '';

			for(p=0; p<page.resultsArr.length; p++) {
				if (page.resultsArr[p].count > 0) {
					console.log(red('┃ [' + page.resultsArr[p].count + '] ') + page.resultsArr[p].id + ' - ' + page.resultsArr[p].description)

					errorsId += page.resultsArr[p].id + '|'

					var errors = page.resultsArr[p].items;

					errors.forEach(element => {
						var keys = Object.keys(element);
						var values = Object.values(element);

						for (const key in keys) {
							console.log(red('┃      ') + (key>0 ? '  ' : '')+ keys[key] + ': ' + values[key])
						}
					});
				}
			}
			console.log(red('┗ '))

			// if(csvFile) {
			// 	csv += ';' + errorsId;
			// }
		}

	} else {

		if(logLevel > 1) {
			console.log(green('✔') + ' ' + page.url + ' (' + harScapedPath + ')');
		} else 	if (logLevel > 0) {
			console.log(green('✔') + ' ' + page.url);
		}

		// if(csvFile) {
		// 	csv += ';'
		// }

	}
};