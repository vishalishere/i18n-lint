/**
 * hslint bin tests
 *
 * Copyright (c) 2014 James Warwood
 * Licensed under the MIT license.
 */
/* global describe, it */
'use strict';

var assert = require('assert');
var exec = require('child_process').exec;
var path = require('path');

var pkg = require('../../package.json');

describe('hslint bin', function() {
  var cmd = 'node ' + path.join(__dirname, '../../bin/hslint') + ' ';

  it('--help should run without errors', function(done) {
    exec(cmd + '--help', function (error, stdout, stderr) {
      assert(!error);
      done();
    });
  });

  it('-h should run without errors', function(done) {
    exec(cmd + '-h', function (error, stdout, stderr) {
      assert(!error);
      done();
    });
  });

  it('--version should run without errors', function(done) {
    exec(cmd + '--version', function (error, stdout, stderr) {
      assert.notEqual(stdout.indexOf(pkg.version), -1);
      assert(!error);
      done();
    });
  });

  it('-V should run without errors', function(done) {
    exec(cmd + '-V', function (error, stdout, stderr) {
      assert.notEqual(stdout.indexOf(pkg.version), -1);
      assert(!error);
      done();
    });
  });

  it('should print error message and usage if no files provided', function(done) {
    exec(cmd, function(error, stdout, stderr) {
      assert.equal(error.code, 64);
      assert.notEqual(stdout.indexOf('No files'), -1);
      assert.notEqual(stdout.indexOf('Usage:'), -1);

      done();
    });
  });

  it('should print error message and fail if invalid reporter used', function(done) {
    exec(cmd + '-r invalidreporter test/fixtures/*.html', function(error, stdout, stderr) {
      assert.equal(error.code, 66);
      assert.notEqual(stderr.indexOf('No reporter called \'invalidreporter\''), -1);

      done();
    });
  });

  it('should exit with 1 if hardcoded strings are found', function(done) {
    exec(cmd + ' test/fixtures/1.html', function(error, stdout, stderr) {
      assert.equal(error.code, 1);
      done();
    });
  });

  it('should exit with 0 if no hardcoded strings are found', function(done) {
    exec(cmd + ' test/fixtures/clean.html', function(error, stdout, stderr) {
      assert(!error);
      done();
    });
  });

  it('should allow a built-in reporter to be specified', function(done) {
    exec(cmd + ' --reporter simple test/fixtures/1.html', function(error, stdout, stderr) {
      assert.equal(stderr.indexOf('No reporter called \'simple\''), -1);

      done();
    });
  });

  it('-i, --ignore-tags option should work as expected', function(done) {
    var args = [
      ' -i "h1,a" test/fixtures/testing.html',
      ' --ignore-tags "h1,a" test/fixtures/testing.html',
    ];

    args.forEach(function(arg, i) {
      exec(cmd + arg, function(err, stdout, stderr) {
        assert.equal(stdout.indexOf('Hardcoded <h1> tag'), -1);
        assert.equal(stdout.indexOf('Hardcoded <a> tag'), -1);
        assert.notEqual(stdout.indexOf('Hardcoded <p> tag'), -1);

        if (i === args.length -1) {
          done();
        }
      });
    });
  });

  it('-t, --template-delimiters option should work as expected', function(done) {
    var args = [
      ' -t "{{,}}" test/fixtures/testing.hbs',
      ' --template-delimiters "{{,}}" test/fixtures/testing.hbs',
    ];

    args.forEach(function(arg, i) {
      exec(cmd + arg, function(err, stdout, stderr) {
        assert.equal(stdout.match(/Hardcoded <(h4|span|button)> tag/g).length, 3);

        if (i === args.length -1) {
          done();
        }
      });
    });
  });

  it('-a, --attributes option should work as expected', function(done) {
    var args = [
      ' -a "title" test/fixtures/multi_instance.html',
      ' --attributes "title" test/fixtures/multi_instance.html',
    ];

    args.forEach(function(arg, i) {
      exec(cmd + arg, function(err, stdout, stderr) {
        assert.equal(stdout.indexOf('Hardcoded \'alt\' attribute'), -1);
        assert.notEqual(stdout.indexOf('Hardcoded \'title\' attribute'), -1);

        if (i === args.length -1) {
          done();
        }
      });
    });
  });

  it('should support piping', function(done) {
    var command = 'cat test/fixtures/testing.html | ' + cmd;

    exec(command, function(err, stdout, stderr) {
      console.log(arguments);
      if (err) {
        return done(err);
      }

      assert.equal(stdout.match(/Hardcoded/g).length, 10);
    });
  });
});
