module.exports = {
	id: 'statusOk',
	description:'Your page must return response status 200',

	rule: function(_page, _results){
		this.url = _page.url;

		var objErro = {
			url: this.url,
			id: this.id,
			description: this.description,
			count: 0,
			items: []
		}
		if(_page.assets[0].status !== 200) {
			objErro.items.push({
				url:  _page.assets[0].url,
				status: _page.assets[0].status
			})
		}
		objErro.count = objErro.items.length;

		_results.push(objErro);
	}
};