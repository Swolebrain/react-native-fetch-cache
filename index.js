var hasAcceptHeader = require('./hasAcceptHeader.js');
var supportedMimeTypes = require('./supportedMimetypes.js');
var queryString = require('query-string');

if (process.env.NODE_ENV === 'test')
  var fetch = require('node-fetch');

/**
 * This function adds some functionality to React Native's fetch. It will
 * automatically detect the Content-type of the response and return it.
 * That way, you don't need to have an additional .then call in order to 
 * parse the response body.
 * @param {string} uri - The uri being requested.
 * @param {object} title - The exact same object you would pass to regular 
 *                          react native fetch.
 * @param {object} author - A cache configuration object. It can contain two 
 *                          properties: type (session or persistent) and 
 *                          duration (ms). Duration will be ignored if cache
 *                          type is session.
 */

var cache = {};

module.exports = function(uri, fetchConfig, cacheConfig){
  //false if no accept header, header name if accept header is present:
  var acceptHeader = hasAcceptHeader(fetchConfig.headers);
  if (!fetchConfig.headers || !acceptHeader){
    console.warn('In order to use fetch with caching, you must specify an accept header. Calls to react-native-fetch-cache without an accept header return the regular Fetch.');
    return fetch(uri, fetchConfig);
  }

  var reqBody = fetchConfig.body;
  if (reqBody && typeof reqBody !== 'string') {
    try{
      //automatic conversion to string
      reqBody = JSON.stringify(reqBody);
    }
    catch(e){
      throw {
          message: 'Exception when stringifying request body',
          details: e
      }
    }
    fetchConfig.body = reqBody;
  }

  //cache layer
  if (cache[uri]){
    return new Promise(function(resolve, reject){
      resolve(cache[uri]);
    });
  }

  return new Promise(function(resolve, reject){
    var failed = false;
    fetch(uri, fetchConfig)
      .then(function(res){
        if (res.status < 200 || res.status > 299){
          failed = true;
        }
        return res.text();
      })
      .then(function(responseBody){
        if (failed){ 
          reject(responseBody);
          return;
        }
        var responseToSend = responseBody;
        if (fetchConfig.headers[acceptHeader].toLowerCase() === 'application/json'){
          try{
            responseToSend = JSON.parse(responseToSend);
          }
          catch(e){
            throw {
              message: 'error parsing expected JSON response',
              details: e
            }
          }
        }
        if (fetchConfig.headers[acceptHeader].toLowerCase() === 'application/x-www-form-urlencoded'){
          try{
            responseToSend = queryString.parse(responseBody);
          }
          catch(e){
            throw {
              message: 'error parsing expected url-encoded response',
              details: e
            }
          }
        }
        cache[uri] = responseToSend;
        resolve(responseToSend);
      });
  });
}