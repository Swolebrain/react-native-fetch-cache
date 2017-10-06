var supportedMimeTypes = require('./supportedMimetypes.js');

module.exports = function(headers){
    if (!headers) return false;
    for (var headerName in headers){
        if (headerName.toLowerCase() === 'accept'
            && supportedMimeTypes.indexOf(headers[headerName]) >= 0){
            return headerName;
        }
    }
    return false;
}

