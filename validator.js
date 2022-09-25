'use strict'

module.exports.isStringNoValid = function (caption, string, minSize, maxSize, mandatory) {
    let res = false;
    if(mandatory && (!string || !string.trim().length)){
        return caption + ' is mandatory and can not be empty';
    }
    if(minSize && string && string.length<minSize){
        return "The minSize for " + caption + " is " + minSize;
    }
    if(maxSize && string && string.length>maxSize){
        return "The maxSize for " + caption + " is " + maxSize;
    }
    return res;
}