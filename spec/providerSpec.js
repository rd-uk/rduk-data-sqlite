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

const data = require('@rduk/data').getInstance();
const db = data.db.db;

const Queryable = require('@rduk/data/lib/queryable');
const SourceExpression = require('@rduk/data/lib/expression/source');

describe('querying inmemory sqlite database', function() {
    it('sould success', function(done) {
      db.serialize(() => {
          db.run('CREATE TABLE users (id INT, email TEXT)');
          db.run('CREATE TABLE profiles (user_id INT, first_name TEXT, last_name TEXT, country TEXT)');

          let stmt1 = db.prepare('INSERT INTO users VALUES (?, ?)');
          stmt1.run(1, 'k.ung@test.com');
          stmt1.finalize();

          let stmt2 = db.prepare('INSERT INTO profiles VALUES (?, ?, ?, ?)');
          stmt2.run(1, 'Kim', 'Ung', 'France');
          stmt2.finalize();

          let users = new Queryable(new SourceExpression('users'));
          let profiles = new Queryable(new SourceExpression('profiles'));

          let query = users
              .join(profiles, (u, p) => (u.id === p.user_id))
              .filter((u, p) => (u.email.endsWith(this.search) && p.country.toUpperCase() === this.country))
              .select((u, p) => ({
                  id: u.id,
                  email: u.email,
                  firstName: p.first_name,
                  lastName: p.last_name.toUpperCase(),
                  country: p.country
              }));

          query.toArray({search: '@test.com', country: 'FRANCE'})
              .then(data => {
                  expect(data).toBeDefined();
                  expect(data.length).toBe(1);
                  expect(data[0].firstName).toBe('Kim');
                  expect(data[0].lastName).toBe('UNG');
                  expect(data[0].country).toBe('France');
                  done();
              });
      });
    });
});
