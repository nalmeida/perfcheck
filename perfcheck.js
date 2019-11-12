const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');

var perfcheck = require('./lib/perfcheck.js');

const init = function(commandLineObject) {

	// Required
	var harfolder = commandLineObject.harfolder;
	var csvFile = commandLineObject.output;

	if(!harfolder) {
		console.error('Error: Path to the HAR folder is required.\nFor help run:\n\t$ node perfcheck --help');
		process.exit(1);
	}
	var logLevel = (commandLineObject.loglevel === undefined) ? 2 : commandLineObject.loglevel;

	perfcheck(harfolder, logLevel, csvFile);
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
			'$ node perfcheck --loglevel 1 --harfolder ./har-files/2019.11.06-17.09.312/ --output ./report.csv\n',
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
				description: 'Log level. {italic Default 2}\n0=Silent, 1=Important only, 2=All.',
				defaultOption: 2
			},
			{
				name: 'output',
				alias: 'o',
				typeLabel: '{underline string}',
				description: 'Path and file name of CSV output file.\nE.g.: {italic ./report.csv}'
			}
		]
	}
]

const usage = commandLineUsage(sections)

const optionDefinitions = [
	{ name: 'help', alias: 'h' },
	{ name: 'loglevel', alias: 'l', type: Number },
	{ name: 'harfolder', alias: 'f', type: String},
	{ name: 'output', alias: 'o', type: String},
]
const options = commandLineArgs(optionDefinitions);

if(typeof(options.help) == 'object') {
	console.log(usage);
} else {
	init(options);
}