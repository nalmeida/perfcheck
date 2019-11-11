const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');

var gethar = require('./lib/gethar.js');

const init = function(commandLineObject) {
	gethar(commandLineObject);
}

const sections = [
	{
		header: 'Get Har',
		content: 'Get HAR files from several pages of the same domain'
	},
	{
		header: 'Usage',
		content: [
			'$ node gethar <options>\n',
			'$ node gethar {italic --help}\n',
			'$ node gethar {italic --loglevel 1} {italic --headless false} {italic --pages anotherfile.json} {italic --domain http://www.myanotherdomain.com} {italic --auth myuser:MyP4ssw0rd}\n',
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
				name: 'loglevel',
				alias: 'l',
				typeLabel: '{underline number}',
				description: 'Log level. {italic Default 2}\n0=Silent, 1=Important only, 2=All.',
				defaultOption: 2
			},
			{
				name: 'domain',
				alias: 'd',
				description: 'Main domain to be tested. When set, it {underline OVERRIDES} the "domain" parameter from the {italic ./config/pages.json} file.'
			},
			{
				name: 'auth',
				alias: 'a',
				typeLabel: '{underline string}:{underline string}',
				description: '{underline username}:{underline password} for the http authentication. When set, it {underline OVERRIDES} the "authenticate" parameter from the {italic ./config/pages.json} file.'
			},
			{
				name: 'headless',
				alias: 'e',
				typeLabel: '{underline boolean}',
				description: 'Set Puppeteer to run in the headless mode. When set, it {underline OVERRIDES} the "headless" parameter from the {italic ./config/config.json} file.'
			},
			{
				name: 'pages',
				alias: 'p',
				typeLabel: '{underline string}',
				description: 'The path to the {italic pages.json} file. Default option uses {italic ./config/pages.json} from the root of the project.'
			}
		]
	}
]

const usage = commandLineUsage(sections)

const optionDefinitions = [
	{ name: 'help', alias: 'h' },
	{ name: 'loglevel', alias: 'l', type: Number },

	{ name: 'domain', alias: 'd', type: String},
	{ name: 'auth', alias: 'a', type: String},
	{ name: 'headless', alias: 'e', type: String},
	{ name: 'pages', alias: 'p', type: String}
]
const options = commandLineArgs(optionDefinitions);

if(typeof(options.help) == 'object') {
	console.log(usage);
} else {
	init(options);
}