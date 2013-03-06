'use strict';
var assert = require('assert');
var uglifyjsConfig = require('../lib/config/uglifyjs.js');

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
  it('should use the input files correctly', function () {
    var ctx = { inDir: 'zzz', inFiles: ['foo.js', 'bar.js', 'baz.js'], outDir: 'tmp/uglifyjs', outFiles: []};
    var cfg = uglifyjsConfig.createConfig( ctx, block );
    assert.ok(cfg['tmp/uglifyjs/foo.js']);
    assert.deepEqual(cfg['tmp/uglifyjs/foo.js'], ['zzz/foo.js']);
    assert.ok(cfg['tmp/uglifyjs/bar.js']);
    assert.deepEqual(cfg['tmp/uglifyjs/bar.js'], ['zzz/bar.js']);
    assert.ok(cfg['tmp/uglifyjs/baz.js']);
    assert.deepEqual(cfg['tmp/uglifyjs/baz.js'], ['zzz/baz.js']);
    assert.deepEqual(ctx.outFiles, ['foo.js', 'bar.js', 'baz.js']);
  });

  it('should use the destination file if it is the laast step of the pipe.', function () {
    var ctx = { inDir: 'zzz', inFiles: ['foo.js', 'bar.js', 'baz.js'], outDir: 'dist', outFiles: [], last: true};
    var cfg = uglifyjsConfig.createConfig( ctx, block );
    assert.ok(cfg['dist/scripts/site.js']);
    assert.deepEqual(cfg['dist/scripts/site.js'], ['zzz/foo.js', 'zzz/bar.js', 'zzz/baz.js']);
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
