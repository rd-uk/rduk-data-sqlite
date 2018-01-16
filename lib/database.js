/**
 * MIT License
 *
 * Copyright (c) 2016 - 2018 RDUK <tech@rduk.fr>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

'use strict';

const errors = require('@rduk/errors');
const sqlite3 = require('sqlite3').verbose();
const SqliteConnectionInfo = require('./connectionInfo');

let databases = new Map();

class SqliteDatabase {
    constructor(file) {
        this.db = new sqlite3.Database(file);
    }
    execute(command, parameters) {
        let fn = command.toLowerCase().indexOf('select') === 0 ? 'all' : 'run';

        return new Promise((resolve, reject) => {
            this.db[fn](command, parameters, function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }
    dispose() {
        this.db.close();
    }

    static create(connection) {
        if (connection instanceof SqliteConnectionInfo !== true) {
            errors.throwArgumentError('connection', connection);
        }

        return new SqliteDatabase(connection.file);
    }
    static get(connection) {
        if (connection instanceof SqliteConnectionInfo !== true) {
            errors.throwArgumentError('connection', connection);
        }

        let id = connection.identifier;

        if (!databases.has(id)) {
            let db = SqliteDatabase.create(connection);
            databases.set(id, db);
        }

        return databases.get(id);
    }
}

module.exports = SqliteDatabase;
