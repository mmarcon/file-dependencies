#!/usr/bin/env node
var fetch = require('./lib/fetch'),
    path = require('path');

var rootNodeModulesFolder = path.resolve(__dirname, '..', '..'),
    fileDependenciesDestination = path.resolve(__dirname, '..', 'file_dependencies'),
    rootPackageJson = path.join(rootNodeModulesFolder, 'package.json');

fetch.prepareDestination(fileDependenciesDestination)
    .then(fetch.checkPackageJSON(rootPackageJson))
    .then(fetch.readPackageJSON)
    .then(fetch.getFileDependencies)
    .then(fetch.fetchDependencies(fileDependenciesDestination))
    .finally(function(){
        console.log('file-dependencies has finished');
    });