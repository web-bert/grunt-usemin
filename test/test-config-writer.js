'use strict'
var assert = require('assert');
var helpers = require('./helpers');
var ConfigWriter = require('../lib/configwriter.js');

describe('ConfigWriter', function () {
  before(helpers.directory('temp'));

  describe('constructor', function() {
    it('should check it\'s input');
    it('should use in and out dirs');
  });

  describe('process', function() {
    var blocks = helpers.blocks();
    var block_with_requirejs = helpers.requirejs_block();

    it('should check for input parameters');

    it('should output a set of config', function () {
      var flow = ['concat', 'uglifyjs'];
      var file = helpers.createFile('foo', 'app', blocks);
      var c = new ConfigWriter( flow, [], {input: 'app', dest: 'dist', staging: '.tmp'} );
      var config = c.process(file);
      assert.deepEqual(config, {
        'concat':{'.tmp/concat/scripts/site.js': ['app/foo.js', 'app/bar.js', 'app/baz.js']},
        'uglifyjs': {'dist/scripts/site.js': ['.tmp/concat/scripts/site.js']}
      });
    });

    it('should have a configurable destination directory', function() {
      var flow = ['concat', 'uglifyjs'];

      var file = helpers.createFile('foo', 'app', blocks);
      var c = new ConfigWriter( flow, [], {input: 'app', dest: 'destination', staging: '.tmp'} );
      var config = c.process(file);
      assert.deepEqual(config, {
        'concat':{'.tmp/concat/scripts/site.js': ['app/foo.js', 'app/bar.js', 'app/baz.js']},
        'uglifyjs': {'destination/scripts/site.js': ['.tmp/concat/scripts/site.js']}
      });
    });

    it('should have a configurable staging directory', function() {
      var flow = ['concat', 'uglifyjs'];

      var file = helpers.createFile('foo', 'app', blocks);
      var c = new ConfigWriter( flow, [], {input: 'app', dest: 'dist', staging: 'staging'} );
      var config = c.process(file);
      assert.deepEqual(config, {
        'concat': { 'staging/concat/scripts/site.js': ['app/foo.js', 'app/bar.js', 'app/baz.js'] },
        'uglifyjs': { 'dist/scripts/site.js': ['staging/concat/scripts/site.js'] }
      });
    });

    it('should allow for single step flow', function() {
      var flow = ['uglifyjs'];

      var file = helpers.createFile('foo', 'app', blocks);
      var c = new ConfigWriter( flow, [], {input: 'app', dest: 'dist', staging: 'staging'} );
      var config = c.process(file);
      assert.deepEqual(config, {'uglifyjs': {'dist/scripts/site.js': ['app/foo.js', 'app/bar.js', 'app/baz.js']}});
    });

    it('should rewrite the requirejs config if needed', function() {
      var flow = ['concat', 'uglifyjs'];

      var file = helpers.createFile('foo', 'app', [block_with_requirejs]);
      var c = new ConfigWriter( flow, ['requirejs'], {input: 'app', dest: 'dist', staging: 'staging'} );
      var config = c.process(file);

      assert.deepEqual(config, {
        'concat':{'staging/concat/scripts/amd-app.js': ['app/scripts/main.js']},
        'uglifyjs': {'dist/scripts/amd-app.js': ['staging/concat/scripts/amd-app.js']},
        'requirejs': { 'default': {
          options: {name: 'main', out: 'dist/scripts/amd-app.js', baseUrl: 'app/scripts', mainConfigFile: 'app/scripts/main.js'}}
        }
      });
    });

    it('should allow for a configuration of the flow\'s step order', function() {
      var flow = ['uglifyjs', 'concat'];

      var file = helpers.createFile('foo', 'app', blocks);
      var c = new ConfigWriter( flow, [], {input: 'app', dest: 'dist', staging: 'staging'} );
      var config = c.process(file);

      assert.deepEqual(config, {
        'uglifyjs': {'staging/uglifyjs/foo.js': ['app/foo.js'], 'staging/uglifyjs/bar.js': ['app/bar.js'], 'staging/uglifyjs/baz.js': ['app/baz.js']},
        'concat': {'dist/scripts/site.js': ['staging/uglifyjs/foo.js', 'staging/uglifyjs/bar.js', 'staging/uglifyjs/baz.js']}
      });
    });

    it('should augment the furnished config', function() {
      var flow = ['concat', 'uglifyjs'];
      var config = {concat: {'foo.js': 'bar.js'}};
      var file = helpers.createFile('foo', 'app', blocks);
      var c = new ConfigWriter( flow, [], {input: 'app', dest: 'destination', staging: '.tmp'} );
      config = c.process(file, config);
      assert.deepEqual(config, {
        'concat':{'.tmp/concat/scripts/site.js': ['app/foo.js', 'app/bar.js', 'app/baz.js'], 'foo.js': 'bar.js'},
        'uglifyjs': {'destination/scripts/site.js': ['.tmp/concat/scripts/site.js']}
      });
    });

    it('should allow for an empty flow');
    it('should allow for a filename as input');
  });
});