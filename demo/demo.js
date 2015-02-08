#!/usr/bin/env node
var fetch = require('../lib/fetch'),
    path = require('path');

var rootNodeModulesFolder = path.resolve(__dirname);
var rootPackageJson = path.join(rootNodeModulesFolder, 'package.demo.json');

fetch.checkPackageJSON(rootPackageJson)
    .then(fetch.readPackageJSON)
    .then(fetch.getFileDependencies)
    .then(fetch.fetchDependencies(rootNodeModulesFolder))
    .done(function(){
        console.log('done');
    });