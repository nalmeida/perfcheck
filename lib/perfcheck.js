const rules = require('../rules/rules.js');
const util = require('./util/util.js');
	const addSlash = util.addSlash;
	const getRecursiveFileList = util.getRecursiveFileList;

var logLevel;
var harFolder;
var filesList;

module.exports = function(_harfolder, _loglevel) {
	util.logLevel = logLevel = _loglevel
	harFolder = addSlash(_harfolder);

	filesList = (getRecursiveFileList(addSlash(harFolder)));
	perfCheck(filesList);
}

var perfCheck = function(filesList) {

	var currentEmulate;

	for (var i=0; i<filesList.length; i++) {

		var emulating = filesList[i].split('/')[2];
		var xray = require('./xray.js');

		if(logLevel > 1 && i == 0) {
			var rulesList = 'Rules\n-----\n'
			for (var k=0; k<rules.length; k++) {
				rulesList += ' ' + (k+1) + '. ' + rules[k]['description'] + '\n';
			}
			console.log(rulesList + '-----');
		}

		if(emulating != currentEmulate) {
			currentEmulate = emulating;
			var separator = '-';
			(logLevel > 0) && console.log('\n' + currentEmulate + '\n' + separator.repeat(currentEmulate.length));
		}

		xray(filesList[i], logLevel);
	}

}