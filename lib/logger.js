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
var cluster = require('cluster');
var bunyan = require('bunyan');
var cuid = require('cuid');
var fs    = require('fs');

// Serialize a request (remove unuseful information from requests,
// log only the necessary).
function requestSerializer(req) {
    if ((typeof(req) !== 'object') || (req === null)) {
        return req;
    }

    var headers = req.headers || {};

    return {
        method: req.method,
        url: req.url,
        headers: { // selective choice of headers (no cookies)
            "host": headers["host"],
            "connection": headers["connection"],
            "cache-control": headers["cache-control"],
            "accept": headers["accept"],
            "user-agent": headers["user-agent"],
            "referer": headers["referer"],
            "accept-encoding": headers["accept-encoding"],
            "accept-language": headers["accept-language"]
        },
        remoteAddress: req.ips[0] || req.ip || null
    };
}

// Serialize a reponse (remove unuseful information from responses
// and calculate the reponse time).
function responseSerializer(res) {
    if ((typeof(res) !== 'object') || (res === null)) {
        return res;
    }

    // Calculate the response time
    var responseTime;
    if (res.start) {
        responseTime = (new Date() - res.start).toString() + " ms";
    }

    return {
        statusCode: res.statusCode,
        responseTime: responseTime
    }
}


var defaultLogger;

module.exports = function(mode) {
    if(mode === "default") {
        // Make sure the logs dir exist
        try {
            fs.mkdirSync('logs');
        }
        catch (e) {
            if ( e.code != 'EEXIST' )
                throw e;
        }

        // Create the default logger

        defaultLogger = bunyan.createLogger({
            name: 'default',
            streams: [{
                level: "info",
                type: 'file',
                path: 'logs/default.log',
            },
            {
                level: "debug",
                type: 'file',
                path: 'logs/debug.log',
            }],
            serializers: {
                req: requestSerializer,
                res: responseSerializer
            }
        });
        if (!cluster.isMaster) {
            defaultLogger = defaultLogger.child({ worker: cluster.worker.id });
        }
         return defaultLogger; 
    }


    else if (mode === "expressAccess") {
        // Export the access logger (log express requests)
        return function (req, res, next) {
            // insert the current time into the response
            // (for later calculation of reponse time).
            res.start = new Date();

            // Insert a log object into the request.
            // The routes can use this object to log messages and all
            // of them can be traced to the request (by req_id).
            req.log = defaultLogger.child({ req_id: cuid.slug() });

            // Log the request
            req.log.debug({req: req}, 'request');

            // Continue to the next handler
            next();

            // Log the response
            req.log.debug({res: res}, 'response');
        };
    }

    else if (mode === "expressError") {
        // Export the express error logger (log errors during request processing)
        return function (err, req, res, next) {
            if (err) {
                defaultLogger.error({err: err}, 'Error while processing request');
            }

            next();
        };
    }
    
    else {
    
        defaultLogger = bunyan.createLogger({
            name: 'stdout',
            stream: process.stdout,
            serializers: {
                req: requestSerializer,
                res: responseSerializer
            }
        });
        if (!cluster.isMaster) {
            defaultLogger = defaultLogger.child({ worker: cluster.worker.id });
        }
         return defaultLogger; 
    }
};


