#!/usr/bin/env node

var async = require('async');
var prompt = require("cli-prompt");
var Metalsmith = require('metalsmith');
var render = require('consolidate').handlebars.render;

Metalsmith(__dirname + '/..')
    .source('./template')
    .destination('./example')
    .use(ask)
    .use(template)
    .build(function(err) {

        if (err) {

            console.log(err); throw err;
        }

    });

/**
 * Prompt plugin.
 *
 * @param {Object} files
 * @param {Metalsmith} metalsmith
 * @param {Function} done
 */

function ask(files, metalsmith, done){
  var prompts = ['name', 'description'];
  var metadata = metalsmith.metadata();

  async.eachSeries(prompts, run, done);

  function run(key, done){
    prompt('  ' + key + ': ', function(val){
      metadata[key] = val;
      done();
    });
  }
}


/**
 * Template in place plugin.
 *
 * @param {Object} files
 * @param {Metalsmith} metalsmith
 * @param {Function} done
 */

function template(files, metalsmith, done) {
    var keys = Object.keys(files);
    var metadata = metalsmith.metadata();

    async.each(keys, run, done);

    function run(file, done) {
        var str = files[file].contents.toString();
        render(str, metadata, function(err, res) {
            if (err) return done(err);
            files[file].contents = new Buffer(res);
            done();
        });
    }
}