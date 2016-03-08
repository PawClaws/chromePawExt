/*
 * Copyright 2014 WebFilings, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var spawn = require('child_process').spawn;

describe('e2e', function() {
    it('should successfully run `grunt` in project', function(done) {
        spawn('grunt', [], { cwd: './test/sample', stdio: 'inherit' })
            .on('error', done)
            .on('exit', function(code) {
                if (code === 0) {
                    done();
                }
                else {
                    done(new Error('Grunt exited with error ' + code));
                }
            });
    }, 20000);
});