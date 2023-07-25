'use strict'

module.exports.getResponse = function (statusCode, body) {
    return {
        statusCode: statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': '*',
            'cache-control': 'public, max-age=0'
        },
        body: JSON.stringify(body)
    };
}