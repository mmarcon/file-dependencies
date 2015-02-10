var request = require('request'),
    fs = require('fs'),
    path = require('path'),
    Q = require('q');

function prepareDestination(path) {
    var deferred = Q.defer();
    fs.exists(path, function (exists) {
        if(exists) {
            return deferred.resolve();
        }
        fs.mkdir(path, function(error){
            if(error) {
                return deferred.reject(/*error*/);
            }
            deferred.resolve();
        });
    });
    return deferred.promise;
}

function checkPackageJSON(packagejson){
    return function() {
        var deferred = Q.defer();
        fs.exists(packagejson, function (exists) {
            if(exists) {
                return deferred.resolve(packagejson);
            }
            deferred.reject(/*not found*/);
        });
        return deferred.promise;
    };
}

function readPackageJSON(packagejson) {
    return require(packagejson);
}

function getFileDependencies(packageObject) {
    var deferred = Q.defer();
    if(packageObject.fileDependencies) {
        deferred.resolve(packageObject.fileDependencies);
    } else {
        deferred.reject(/*no file dependencies*/);
    }
    return deferred.promise;
}

function fetchDependencies(basepath) {
    return function(fileDependencies){
        var promises = [];
        Object.keys(fileDependencies).forEach(function(destination){
            var pathOrUrlOrObject = fileDependencies[destination];
            if(typeof pathOrUrlOrObject === 'string') {
                promises.push(_fetchDependency(basepath, pathOrUrlOrObject, destination));
            } else {
                promises.push(_fetchDependency(basepath, _parsePlatformDependency(pathOrUrlOrObject, process), destination));
            }
        });
        return Q.all(promises);
    };
}

//Supports objects of type
// {
//    "darwin": "https://some.deps.com/osx",
//    "linux": {
//      "ia32": "https://some.deps.com/linux_32",
//      "x64": "https://some.deps.com/linux_64"
//    },
//    "win32": "https://some.deps.com/windows.exe"
// }
function _parsePlatformDependency(object, process) {
    var platformUrlOrObject = object[process.platform];
    if(!platformUrlOrObject) {
        //nothing to install for this OS
        return false;
    }
    if(typeof platformUrlOrObject === 'string') {
        return platformUrlOrObject;
    }
    var archUrl = platformUrlOrObject[process.arch];
    if(archUrl) {
        return archUrl;
    }
    return false;
}

function _fetchDependency(basepath, pathOrUrl, destination) {
    if(/http(?:s)?\:\/\//.test(pathOrUrl)) {
        //then it's something we can fetch from the internet
        return _fetchRemoteDependency(pathOrUrl, path.join(basepath, destination));
    } else {
        //Otherwise assume local file
        return _fetchLocalDependency(path.resolve(pathOrUrl), path.join(basepath, destination));
    }
}

function _fetchRemoteDependency(url, destination) {
    var deferred = Q.defer();
    console.log('Copying ' + url + ' to ' + destination);
    request(url)
        .on('response', function(response){
            if(response.statusCode !== 200) {
                deferred.reject(/*HTTP error*/);
            }
        })
        .pipe(fs.createWriteStream(destination))
        .on('finish', function(){
            deferred.resolve();
        })
        .on('error', function(){
            deferred.reject(/*error*/);
        });

    return deferred.promise;
}

function _fetchLocalDependency(path, destination) {
    var deferred = Q.defer();
    console.log('Copying ' + path + ' to ' + destination);
    fs.exists(path, function (exists) {
        if(exists) {
            return fs.createReadStream(path)
                .pipe(fs.createWriteStream(destination))
                .on('finish', function(){
                    deferred.resolve();
                })
                .on('error', function(){
                    deferred.reject(/*error*/);
                });
        }

        deferred.reject(/*not found*/);
    });
    return deferred.promise;
}

module.exports = {
    prepareDestination: prepareDestination,
    checkPackageJSON: checkPackageJSON,
    readPackageJSON: readPackageJSON,
    getFileDependencies: getFileDependencies,
    fetchDependencies: fetchDependencies,
    _parsePlatformDependency: _parsePlatformDependency
};