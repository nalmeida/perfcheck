
const MAX_IMAGE_SIZE = 250; // in Kb

module.exports = {
	id: 'lightImages',
	description: 'All images must be lighter than ' + MAX_IMAGE_SIZE + ' kb',

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
		var getImgs = function(assets) {
			var imgs = [];
			imgs = assets.filter(function(item) {
				return item.type == 'image';
			});
			return imgs;
		}

		var getHeavyImgs = function (imgs) {
			var heavyImgs = [];
			heavyImgs = imgs.filter(function(item) {
				// console.log(item.url)
				return item.transferSize > MAX_IMAGE_SIZE * 1000;
			})
			return heavyImgs;
		}

		var arrLargeImages = getHeavyImgs(getImgs(arrAssets))

		var convertToKb = function(_transferSize) {
			return ((_transferSize / 1000).toFixed(2).toString().replace('.',',').replace(/\B(?=(\d{3})+(?!\d))/g, ".")) + ' Kb';
		}

		arrLargeImages.forEach(element => {
				objErro.items.push({
					url:  element.url,
					size: convertToKb(element.transferSize)
				})
		});
		objErro.count = objErro.items.length;

		_results.push(objErro);
	}
};