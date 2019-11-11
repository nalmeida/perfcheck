const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');

var perfcheck = require('./lib/perfcheck.js');

const init = function(commandLineObject) {

	// Required
	var harfolder = commandLineObject.harfolder;
	if(!harfolder) {
		console.error('Error: Path to the HAR folder is required.\nFor help run:\n\t$ node perfcheck --help');
		process.exit(1);
	}
	var logLevel = !isNaN(commandLineObject.loglevel) ? commandLineObject.loglevel : 0;

	// Your code

	perfcheck(harfolder, logLevel);
}

const sections = [
	{
		header: 'Perf Check',
		content: 'Run your own performance check based on a collection of HAR files inside a folder'
	},
	{
		header: 'Usage',
		content: [
			'$ node perfcheck <options>\n',
			'$ node perfcheck --harfolder ./har-files/2019.11.06-17.09.312/\n',
			'$ node perfcheck --loglevel 2 --harfolder ./har-files/2019.11.06-17.09.312/\n',
		]
	},
	{
		header: 'Options List',
		optionList: [
			{
				name: 'help',
				alias: 'h',
				description: 'Print out helpful information.'
			},
			{
				name: 'harfolder',
				alias: 'f',
				description: 'Path to the HAR folder used as the base for the performance check.'
			},
			{
				name: 'loglevel',
				alias: 'l',
				typeLabel: '{underline number}',
				description: 'Log level. {italic Default 0}\n0=Silent, 1=Important only, 2=All.',
				defaultOption: 0
			}
		]
	}
]

const usage = commandLineUsage(sections)

const optionDefinitions = [
	{ name: 'help', alias: 'h' },
	{ name: 'loglevel', alias: 'l', type: Number },
	{ name: 'harfolder', alias: 'f', type: String},
]
const options = commandLineArgs(optionDefinitions);

if(typeof(options.help) == 'object') {
	console.log(usage);
} else {
	init(options);
}