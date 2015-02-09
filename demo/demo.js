#!/usr/bin/env node
var fetch = require('../lib/fetch'),
    path = require('path');

var rootNodeModulesFolder = path.resolve(__dirname),
    fileDependenciesDestination = path.join(__dirname, 'file_dependencies'),
    rootPackageJson = path.join(rootNodeModulesFolder, 'package.demo.json');

fetch.prepareDestination(fileDependenciesDestination)
    .then(fetch.checkPackageJSON(rootPackageJson))
    .then(fetch.readPackageJSON)
    .then(fetch.getFileDependencies)
    .then(fetch.fetchDependencies(fileDependenciesDestination))
    .finally(function(){
        console.log('done');
    });