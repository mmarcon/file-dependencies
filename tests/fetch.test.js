#!/usr/bin/env node
var fetch = require('../lib/fetch'),
    fs = require('fs'),
    path = require('path'),
    test = require('tape'),
    tapSpec = require('tap-spec'),
    nock = require('nock');

//Disable console log as it iterferes with pretty test output.
console.log = function(){};

test.createStream()
  .pipe(tapSpec())
  .pipe(process.stdout);

var rootNodeModulesFolder = __dirname,
    fileDependenciesDestination = path.join(__dirname, 'fixtures', 'destination'),
    rootPackageJson = path.join(rootNodeModulesFolder, 'fixtures', 'package.test.json');

//Ugly Cleanup
try {
    fs.unlinkSync(path.join(fileDependenciesDestination, 'http.file.txt'));
    fs.unlinkSync(path.join(fileDependenciesDestination, 'local.file.txt'));
    fs.rmdirSync(fileDependenciesDestination);
}
catch(e){}

test('prepare destination', function(t){
    t.plan(1);
    fetch.prepareDestination(fileDependenciesDestination)
        .then(function(){
            fs.exists(fileDependenciesDestination, function(exists){
                t.true(exists, 'destination was created');
            });
        });
});

test('check package.json', function(t){
    t.plan(1);
    fetch.checkPackageJSON(rootPackageJson)()
        .then(function(packagejson){
            t.deepEqual(packagejson, rootPackageJson);
        });
});

test('read package.json', function(t){
    t.plan(1);
    var packagejson = fetch.readPackageJSON(rootPackageJson);
    t.ok(packagejson.name, 'package.json was read and name propery exists');
});

test('get file dependencies', function(t){
    t.plan(2);
    var packagejson = fetch.readPackageJSON(rootPackageJson)
    fetch.getFileDependencies(fetch.readPackageJSON(rootPackageJson))
        .then(function(fileDependencies){
            t.ok(fileDependencies['http.file.txt'], 'file dependency is there');
            t.ok(fileDependencies['local.file.txt'], 'other file dependency is there');
        });
});

test('fetch dependencies (local and remote)', function(t){
    t.plan(2);

    nock('http://some.file.com')
        .get('/http.file.txt')
        .replyWithFile(200, path.join(__dirname, 'fixtures', 'source', 'http.file.txt'));

    fetch.prepareDestination(fileDependenciesDestination)
        .then(fetch.checkPackageJSON(rootPackageJson))
        .then(fetch.readPackageJSON)
        .then(fetch.getFileDependencies)
        .then(fetch.fetchDependencies(fileDependenciesDestination))
        .finally(function(){
            fs.exists(path.join(fileDependenciesDestination, 'http.file.txt'), function(exists){
                t.true(exists, 'remote file was fetched');
            });
            fs.exists(path.join(fileDependenciesDestination, 'local.file.txt'), function(exists){
                t.true(exists, 'local file was fetched');
            });
        });
});

test('parse platform dependency', function(t){
    t.plan(4);
    var platformObject = {
        "darwin": "https://some.deps.com/osx",
        "linux": {
            "ia32": "https://some.deps.com/linux_32",
            "x64": "https://some.deps.com/linux_64"
        },
        "win32": "https://some.deps.com/windows.exe"
    };
    t.deepEqual(fetch._parsePlatformDependency(platformObject, {platform: 'darwin'}), 'https://some.deps.com/osx', 'darwin dependency found');
    t.deepEqual(fetch._parsePlatformDependency(platformObject, {platform: 'linux', arch: 'ia32'}), 'https://some.deps.com/linux_32', 'linux 32 dependency found');
    t.deepEqual(fetch._parsePlatformDependency(platformObject, {platform: 'linux', arch: 'x64'}), 'https://some.deps.com/linux_64', 'linux 64 dependency found');
    t.deepEqual(fetch._parsePlatformDependency(platformObject, {platform: 'win32', arch: 'x64'}), 'https://some.deps.com/windows.exe', 'windows dependency found');
});