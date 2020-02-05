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

var os = require('os');
var path = require('path');
var minimist = require('minimist');
var cluster = require('cluster');
var fs = require('fs');


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

var config = {};
var devMode = argv.dev || (process.env.NODE_ENV && (process.env.NODE_ENV.slice(0,3) === 'dev'));
var port = parseInt(argv.port || argv.p || process.env.PORT) || 3000;
var numWorkers = parseInt(argv['num-workers'] || argv.n) || (os.cpus().length);
var daemon = argv.daemon || argv.d || false;
var pidfile = argv['pid-file'] || config.pid_file || process.env.PID_FILE || path.resolve('/run/', 'webserver.pid');
var stdoutLog = argv['stdout-log'] || false;

if (devMode) {
    // In dev mode force a single process
    numWorkers = 1;
}

// Create worker
function createWorker() {
    // Fork process
    if (cluster.isMaster) {
        // daemonize the process (useful for init.d scripts and similar)
        if (daemon) {
            /***
             * WARNING: There is a bug in the package daemon
             * child_process.js:422
             *      throw new ERR_INVALID_ARG_TYPE('options.cwd', 'string', options.cwd);
             * if you import daemon with no parameters ( require('daemon')(opt); ), the
             * above error will be raised. You can pass the opt parameter, so the package
             * does not use the function process.cwd as a property.
             */
            var opt = {
                "env": process.env,
                "cwd": process.cwd()
            };
            require('daemon')(opt);
            fs.writeFileSync(pidfile, process.pid);
        }

        console.log('Starting server in '+ (devMode ? 'development' : 'production') +
        ' mode, spawning ' + numWorkers + ' workers');

        var child = cluster.fork();
        
        // Respawn child process.
        child.on('exit', function(worker, code, signal) {
            console.log('Worker ' + worker.id + ' has died with code: ' + code + ', signal: ' + signal +
            '.\nRestarting it...');
            createWorker();
        });
    } else {  // New worker running; load app
        require('./app');
    }
}

function createWorkers(n) {
    for (var i = 0; i < n; i++) {
        createWorker();
    }
}

function killAllWorkers(signal) {
  var id,
      worker;

  for (id in cluster.workers) {
    if (cluster.workers.hasOwnProperty(id)) {
      worker = cluster.workers[id];
      worker.removeAllListeners();
      worker.process.kill(signal);
    }
  }
}

process.on('SIGHUP', function () {
  killAllWorkers('SIGTERM');
  createWorkers(numWorkers);
});

process.on('SIGTERM', function () {
  killAllWorkers('SIGTERM');
});

// Create a worker per CPU; or user defined.
createWorkers(numWorkers);

