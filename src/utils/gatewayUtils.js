const _ = require('lodash');
const axios = require('axios');
const querystring = require('querystring');
const { URL } = require('url');

module.exports = function gatewayUtils(config, errors) {
  return {
    fetch,
    urlFactory,
  };

  function fetch(url, { method = 'GET', body } = {}, context = {}) {
    const { timeout } = config.fetch;

    function buildHeaders(context) {
      const headers = {};
      const { forwardHeaders } = config.fetch;

      forwardHeaders.forEach(({ header, contextField }) =>
        _.set(headers, header, _.get(context, contextField))
      );

      return _.omitBy(headers, _.isUndefined);
    }

    return axios(url, {
      method,
      headers: buildHeaders(context),
      data: body,
      timeout,
    })
      .then((res) => Promise.resolve({ status: res.status, data: res.data }))
      .catch((err) => {
        if (err.code === 'ECONNABORTED')
          throw errors.create(504, `Fetch to ${url} timed out`);

        throw errors.FromAxios(err);
      });
  }

  function urlFactory(path, baseUrl, query = {}) {
    const parsedQuery = _.isEmpty(query)
      ? ''
      : `?${querystring.stringify(query)}`;

    const url = new URL(path + parsedQuery, baseUrl);
    return url.href;
  }
};
