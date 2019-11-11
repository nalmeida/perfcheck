module.exports = {
	id: '#RULE_NAME',
	description:'#RULE Description...',

	rule: function(_page, _results){
		this.url = _page.url;

		var objErro = {
			url: this.url,
			id: this.id,
			description: this.description,
			count: 0,
			items: []
		}

		console.log(_page);

		// YOUR LOGIC ...
		// if( YOUR LOGIC FINDS ERRORS) {
		// 	objErro.items.push({
		// 		some: 'thing',
		// 		you: 'want to',
		// 		display: 'in the error log'
		// 	})
		// }

		// set error count to the number you found
		objErro.count = objErro.items.length;

		// push your error object to the global array
		_results.push(objErro);
	}
};