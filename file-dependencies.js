#!/usr/bin/env node
var fetch = require('./lib/fetch'),
    path = require('path');

var rootNodeModulesFolder = path.resolve(__dirname, '..', '..');
var rootPackageJson = path.join(rootNodeModulesFolder, 'package.json');

fetch.checkPackageJSON(rootPackageJson)
    .then(readPackageJSON)
    .then(getFileDependencies)
    .then(fetchDependencies)
    .done(function(){
        console.log('done');
    });