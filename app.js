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
var app = express();
var logger = require('./lib/logger.js');
var log = logger("default");

app.get('/', function (req, res) {
    //log.info('Middleware GET / ');
    res.send('Hello World!');
});

process.on('SIGTERM', function () {
    if (app === undefined) return;

    app.close(function () {
        // Disconnect from cluster master
        process.disconnect && process.disconnect();
    });
});

module.exports = app;
