'use strict';
var assert = require('assert');
var concatConfig = require('../lib/config/concat.js');

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

describe('Concat config write', function () {
  it('should exhibit a name', function() {
    assert.equal(concatConfig.name, 'concat');
  });

  it('should use the input files correctly', function () {
    var ctx = { inDir: '.', inFiles: ['foo.js', 'bar.js', 'baz.js'], outDir: 'tmp/concat', outFiles: []};
    var cfg = concatConfig.createConfig( ctx, block );
    assert.ok(cfg['tmp/concat/scripts/site.js']);
    assert.deepEqual(cfg['tmp/concat/scripts/site.js'], ['foo.js', 'bar.js', 'baz.js']);
    assert.deepEqual(ctx.outFiles, ['scripts/site.js']);
  });
});
