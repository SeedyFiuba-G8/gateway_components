const _ = require('lodash');
const axios = require('axios');

module.exports = function $fetch(config, errors) {
	return function fetch(
		url,
		{ method = 'GET', body, headers = {} } = {},
		context = {}
	) {
		const { timeout } = config.fetch;

		return axios(url, {
			method,
			headers: buildHeaders(context, headers),
			data: body,
			timeout,
		})
			.then((res) =>
				Promise.resolve({ status: res.status, data: res.data })
			)
			.catch((err) => {
				if (err.code === 'ECONNABORTED')
					throw errors.create(504, `Fetch to ${url} timed out`);

				throw errors.FromAxios(err);
			});
	};

	// Aux
	function buildHeaders(context, headers) {
		const forwardedHeaders = {};
		const { forwardHeaders } = config.fetch;

		forwardHeaders.forEach(({ header, contextField }) =>
			_.set(forwardedHeaders, header, _.get(context, contextField))
		);

		return _.omitBy({ ...forwardedHeaders, ...headers }, _.isUndefined);
	}
};
