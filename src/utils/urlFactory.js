const _ = require('lodash');
const querystring = require('querystring');
const { URL } = require('url');

module.exports = function $urlFactory() {
	return function urlFactory(path, baseUrl, query = {}) {
		const parsedQuery = _.isEmpty(query)
			? ''
			: `?${querystring.stringify(query)}`;

		const url = new URL(path + parsedQuery, baseUrl);
		return url.href;
	};
};
