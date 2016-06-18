"use strict";

var utils = require('./utils');
var configuration = require('./configure');
var request = require('requestretry');
var qs = require('querystring');

function getHost() {
    return utils.getDefaultApiEndpoint(configuration.default_options.mode);
}

function getHttpOptions(http_options) {
    if (!http_options) {
        http_options = configuration.default_http_options;
    } else {
        http_options = utils.merge(http_options, configuration.default_http_options, true);
    }

    // set host
    http_options.host = getHost();

    return http_options;
}

function getPathWithParams(path, data, api_key) {
    if (typeof data !== 'string') {
        data = qs.stringify(data);
    }

    if (data) {
        path = path + "?" + data + "&apiKey=" + api_key;
    } else {
        // add api key to request
        path += "?apiKey=" + api_key;
    }
    return path;
}

exports.get = function executeGetRequest(path, data, http_options, cb) {
    request.defaults({
        json: true,
        maxAttempts: 5, // (default) try 5 times
        retryDelay: 5000,  // (default) wait for 5s before trying again
        retryStrategy: request.RetryStrategies.HTTPOrNetworkError
    });

    if (typeof http_options === "function") {
        cb = http_options;
        http_options = null;
    }

    http_options = getHttpOptions(http_options);

    http_options.uri = http_options.host + getPathWithParams(path, data, configuration.default_options.api_key);

    request.get(http_options , function (error, response, body) {

        if (error) {
            console.log('Problem with request: ', error);
            cb(error, null);
            return;
        }

        var err = null;

        if (!err && (response.statusCode < 200 || response.statusCode >= 300)) {
            err = new Error('Response Status : ' + response.statusCode);
            err.response = response;
            if (process.env.NODE_ENV === 'development') {
                err.response_stringified = JSON.stringify(response);
            }
            err.httpStatusCode = response.statusCode;
            response = null;
        }

        cb(err, body);
    });
};

function executePostRequest() {

    return null;
}

function executePutRequest() {

    return null;
}

function executeDeleteRequest() {

    return null;
}