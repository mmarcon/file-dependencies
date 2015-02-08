var request = require('request'),
    fs = require('fs'),
    path = require('path'),
    Q = require('q');

function getPackageJSON(){
    var deferred = Q.defer(),
    packagejson = path.resolve(__dirname, '..', '..', 'package.json');
    fs.exists(packagejson, function (exists) {
        if(exists) {
            return deferred.resolve(packagejson);
        }
        deferred.reject(/*not found*/);
    });
    return deferred.promise;
}

function readPackageJSON(packagejson) {
    return require(packagejson);
}

function getFileDependencies(packageObject) {
    var deferred = Q.defer();
    if(packageObject.fileDependencies) {
        deferred.resolve(fileDependencies);
    } else {
        deferred.reject();
    }
    return deferred.promise;
}