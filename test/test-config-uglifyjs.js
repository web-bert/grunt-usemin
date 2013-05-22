'use strict';
var assert = require('assert');
var uglifyjsConfig = require('../lib/config/uglifyjs.js');
var path = require('path');

var block = {
    type: 'js',
    dest: 'scripts/site.js',
    src: [
      'foo.js',
      'bar.js',
      'baz.js'
    ],
    raw: [
      '    <!-- build:js scripts/site.js -->',
      '    <script src="foo.js"></script>',
      '    <script src="bar.js"></script>',
      '    <script src="baz.js"></script>',
      '    <!-- endbuild -->'
    ]
  };

describe('Uglifyjs config write', function () {
  it('should have a correct name', function() {
    assert.equal(uglifyjsConfig.name, 'uglify');
  });

  it('should use the input files correctly', function () {
    var ctx = { inDir: 'zzz', inFiles: ['foo.js', 'bar.js', 'baz.js'], outDir: 'tmp/uglifyjs', outFiles: []};
    var cfg = uglifyjsConfig.createConfig( ctx, block );
    assert.ok(cfg[path.normalize('tmp/uglifyjs/foo.js')]);
    assert.deepEqual(cfg[path.normalize('tmp/uglifyjs/foo.js')], [path.normalize('zzz/foo.js')]);
    assert.ok(cfg[path.normalize('tmp/uglifyjs/bar.js')]);
    assert.deepEqual(cfg[path.normalize('tmp/uglifyjs/bar.js')], [path.normalize('zzz/bar.js')]);
    assert.ok(cfg[path.normalize('tmp/uglifyjs/baz.js')]);
    assert.deepEqual(cfg[path.normalize('tmp/uglifyjs/baz.js')], [path.normalize('zzz/baz.js')]);
    assert.deepEqual(ctx.outFiles, ['foo.js', 'bar.js', 'baz.js']);
  });

  it('should use the destination file if it is the laast step of the pipe.', function () {
    var ctx = { inDir: 'zzz', inFiles: ['foo.js', 'bar.js', 'baz.js'], outDir: 'dist', outFiles: [], last: true};
    var cfg = uglifyjsConfig.createConfig( ctx, block );
    assert.ok(cfg[path.normalize('dist/scripts/site.js')]);
    assert.deepEqual(cfg[path.normalize('dist/scripts/site.js')], [path.normalize('zzz/foo.js'), path.normalize('zzz/bar.js'), path.normalize('zzz/baz.js')]);
    assert.deepEqual(ctx.outFiles, ['scripts/site.js']);
  });


  // it('should allow for concatenation', function () {
  //   var requirejsConfig = {};
  //   var co = new uglifyjsConfig( 'tmp/uglifyjs', requirejsConfig );
  //   var ctx = { inFiles: ['foo.js', 'bar.js', 'baz.js'], outFiles: []};
  //   var cfg = co.createConfig( ctx, block );
  //   assert.ok(cfg['tmp/uglifyjs/foo.js']);
  //   assert.deepEqual(cfg['tmp/uglifyjs/scripts/site.js'], ['foo.js', 'bar.js', 'baz.js']);
  //   assert.deepEqual(ctx.outFiles, ['tmp/uglifyjs/scripts/site.js']);
  // });

});
