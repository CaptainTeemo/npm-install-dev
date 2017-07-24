#!/usr/bin/env node

/**
 * @Author: captainteemo
 * @Date:   2017-07-24T14:40:48+08:00
 * @Filename: index.js
 * @Last modified by:   captainteemo
 * @Last modified time: 2017-07-24T18:21:52+08:00
 */

// process.argv[2] for args
// __dirname for current dir name
// __filename for current filename

if (process.argv[2] === 'undefined') {
    throw new Error('please pass a path to your module');
}

const path = require('path');
const modulePath = process.cwd() + '/' + process.argv[2];
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const readFile = util.promisify(fs.readFile);
const readdir = util.promisify(fs.readdir);
const rename = util.promisify(fs.rename);
const exists = fs.existsSync;
const symlink = util.promisify(fs.symlink);

async function installModule() {
    const packageBuffer = await readFile(modulePath + '/package.json');
    const package = JSON.parse(packageBuffer.toString());
    const packageName = package.name;
    const dependencies = package.dependencies;
    const deps = Object.keys(dependencies).map((dep) => {
        return `${dep}@${dependencies[dep]}`;
    });
    const installCommand = `npm install ${deps.join(' ')}`;
    console.log('Installing node modules...');
    await exec(`npm install ${installCommand}`);
    console.log('Linking...');
    await exec('react-native link');

    const packageDest = `${process.cwd()}/node_modules/${packageName}`;
    const dirExists = exists(packageDest);
    if (!dirExists) {
        console.log('Moving...');
        await rename(modulePath, packageDest);
        console.log('Making alias...');
        await symlink(packageDest, modulePath, 'dir');
    }
    console.log('done');
}

installModule()
.catch((e) => {
    console.log(e);
});
