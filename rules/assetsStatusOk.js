module.exports = {
	id: 'assetsStatusOk',
	description: 'All your assets must load with no errors (status < 400)',
	rule: function(_page, _results){
		this.url = _page.url;

		var objErro = {
			url: this.url,
			id: this.id,
			description: this.description,
			count: 0,
			items: []
		}

		var arrAssets = _page.assets;
		arrAssets.forEach(element => {
			if(element.status >= 400) {
				objErro.items.push({
					url:  element.url,
					type: element.type,
					status: element.status
				})
			}
		});
		objErro.count = objErro.items.length;

		_results.push(objErro);
	}
};