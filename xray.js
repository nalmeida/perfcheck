const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');

var xray = require('./lib/xray.js');

const init = function(commandLineObject) {

	// Required
	var har = commandLineObject.har;
	if(!har) {
		console.error('Error: Path to a HAR file is required.\nFor help run:\n\t$ node xray --help');
		process.exit(1);
	}

	var logLevel = (commandLineObject.loglevel === undefined) ? 2 : commandLineObject.loglevel;

	xray(har, logLevel);
}

const sections = [
	{
		header: 'Performance XRay',
		content: 'Run your own performance check based on a HAR file.'
	},
	{
		header: 'Usage',
		content: [
			'$ node xray <options>\n',
			'$ node xray --har ./path/to/your/harfile.har\n',
			'$ node xray --loglevel 2 --har ./path/to/your/harfile.har\n',
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
				name: 'har',
				description: 'Path of your HAR file.'
			},
			{
				name: 'loglevel',
				alias: 'l',
				typeLabel: '{underline number}',
				description: 'Log level. {italic Default 2}\n0=Silent, 1=Important only, 2=All.',
				defaultOption: 2
			}
		]
	}
]

const usage = commandLineUsage(sections)

const optionDefinitions = [
	{ name: 'help', alias: 'h' },
	{ name: 'loglevel', alias: 'l', type: Number },
	{ name: 'har', type: String },
]
const options = commandLineArgs(optionDefinitions);

if(typeof(options.help) == 'object') {
	console.log(usage);
} else {
	init(options);
}