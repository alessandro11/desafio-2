#!/usr/bin/env node
/*
 * Copyright (C) 2012 Centro de Computacao Cientifica e Software Livre
 * Departamento de Informatica - Universidade Federal do Parana - C3SL/UFPR
 *
 * This file is part of simmc
 *
 * simmc is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301,
 * USA.
 */


var express = require('express');
var os = require('os');
var path = require('path');
var minimist = require('minimist');
var app = express();


//
// Parse command line arguments
//
var argv = minimist(process.argv.slice(2));
if (argv.help || argv.h) {
    console.log('Usage: server.js [OPTION]...');
    console.log('');
    console.log('Where OPTION can be:');
    console.log('    -c, --config       alternative configuration file (default: config.js)');
    console.log('    -p, --port         port where the server will listen to');
    console.log('    --dev              force development mode');
    console.log('    -n, --num-workers  number of worker processes to spawn');
    console.log('    -d, --daemon       start the server as a daemon');
    console.log('    --pid-file         path for the pid file when running as a daemon');
    console.log('    --stdout-log       output log on standard output');
    console.log('    -h, --help         show this help and exit');
    return 0;
}

var configFile = argv.config || argv.c || 'config.js';
var config;
try {
    config = require(path.resolve('.', configFile));
} catch( e ) {
    if (e.code === 'MODULE_NOT_FOUND') {
        console.error('No ' + configFile + ', fallback to default values.\n');
        config = {};
    }
    else {
        console.error('Error while parsing configuration file ('+configFile+')!\n');
        console.error(e.stack);
        return 2;
    }    
}

var devMode = argv.dev || 
    (process.env.NODE_ENV && (process.env.NODE_ENV.slice(0,3) === 'dev')) || 'dev';
var port = parseInt(argv.port || argv.p || process.env.PORT) || 3000;
var numWorkers = parseInt(argv['num-workers'] || argv.n) || (os.cpus().length);
var daemon = argv.daemon || argv.d || false;
var pidfile = argv['pid-file'] || config.pid_file || process.env.PID_FILE || path.resolve('/run/', 'webserver.pid');
var stdoutLog = argv['stdout-log'] || false;

console.log('param=',devMode, port, numWorkers, daemon, pidfile, stdoutLog);
return 0;
app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

