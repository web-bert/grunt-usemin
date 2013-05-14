'use strict';
var path = require('path');
var assert = require('assert');
var grunt = require('grunt');
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');

grunt.task.init([]);
grunt.config.init({});

var opts = grunt.cli.options;
opts.redirect = !opts.silent;

var directory = function directory(dir) {
  return function directory(done) {
    process.chdir(__dirname);
    rimraf(dir, function (err) {
      if (err) {
        return done(err);
      }
      mkdirp(dir, function (err) {
        if (err) {
          return done(err);
        }
        process.chdir(dir);
        done();
      });
    });
  };
};

describe('usemin', function () {
  describe('absolute paths', function () {
    beforeEach(directory('temp'));

    it('should replace with revved files when found', function () {
        grunt.file.mkdir('build');
        grunt.file.mkdir('build/images');
        grunt.file.mkdir('build/images/misc');
        grunt.file.write('build/images/23012.test.png', 'foo');
        grunt.file.write('build/images/23012.bar.png', 'foo');
        grunt.file.write('build/images/misc/2a436.test.png', 'foo');
        grunt.file.copy(path.join(__dirname, 'fixtures/htmlprocessor_absolute.html'), 'build/index.html');

        grunt.log.muted = true;
        grunt.config.init();
        grunt.config('usemin', {html: 'build/index.html'});
        // grunt.file.copy(path.join(__dirname, 'fixtures/usemin.html'), 'index.html');
        grunt.task.run('usemin');
        grunt.task.start();

        var changed = grunt.file.read('build/index.html');

        assert.ok(changed.match(/<img src="\/images\/23012\.test\.png">/));
        assert.ok(changed.match(/<img src="\/\/images\/23012\.bar\.png">/));
        assert.ok(changed.match(/<img src="\/images\/misc\/2a436\.test\.png">/));

      });

    it('should take into account alternate search path for assets', function () {
        grunt.file.mkdir('build');
        grunt.file.mkdir('foo');
        grunt.file.mkdir('foo/images');
        grunt.file.mkdir('foo/images/foo');
        grunt.file.write('foo/images/23012.test.png', 'foo');
        grunt.file.write('foo/images/23012.bar.png', 'foo');
        grunt.file.write('foo/images/misc/2a436.test.png', 'foo');
        grunt.file.copy(path.join(__dirname, 'fixtures/htmlprocessor_absolute.html'), 'build/index.html');

        grunt.log.muted = true;
        grunt.config.init();
        grunt.config('usemin', {html: 'build/index.html', options: { assetsDirs: ['foo']}});
        grunt.task.run('usemin');
        grunt.task.start();

        var changed = grunt.file.read('build/index.html');

        assert.ok(changed.match(/<img src="\/images\/23012\.test\.png">/));
        assert.ok(changed.match(/<img src="\/\/images\/23012\.bar\.png">/));
        assert.ok(changed.match(/<img src="\/images\/misc\/2a436\.test\.png">/));

      });

    it('should allow for several asset dirs', function () {
        grunt.file.mkdir('build');
        grunt.file.mkdir('foo');
        grunt.file.mkdir('foo/images');
        grunt.file.mkdir('foo/images/misc');
        grunt.file.write('foo/images/23012.test.png', 'foo');
        grunt.file.write('foo/images/23012.bar.png', 'foo');
        grunt.file.write('foo/images/misc/2a436.test.png', 'foo');
        grunt.file.mkdir('bar');
        grunt.file.mkdir('bar/scripts');
        grunt.file.write('bar/scripts/12345.plugins.js', 'bar');
        grunt.file.write('bar/scripts/6789.amd-app.js', 'bar');
        grunt.file.copy(path.join(__dirname, 'fixtures/htmlprocessor_absolute.html'), 'build/index.html');

        grunt.log.muted = true;
        grunt.config.init();
        grunt.config('usemin', {html: 'build/index.html',  options: { assetsDirs: ['foo', 'bar']}});
        grunt.task.run('usemin');
        grunt.task.start();

        var changed = grunt.file.read('build/index.html');

        assert.ok(changed.match(/<img src="\/images\/23012\.test\.png">/));
        assert.ok(changed.match(/<img src="\/\/images\/23012\.bar\.png">/));
        assert.ok(changed.match(/<img src="\/images\/misc\/2a436\.test\.png">/));
        assert.ok(changed.match(/<script src="\/scripts\/12345\.plugins\.js">/));
        assert.ok(changed.match(/<script data-main="\/scripts\/6789\.amd-app"/));

      });

  });

  describe('relative paths', function () {
    beforeEach(directory('temp'));

    it('should replace with revved files when found', function () {
        grunt.file.mkdir('build');
        grunt.file.mkdir('build/images');
        grunt.file.mkdir('build/foo');
        grunt.file.mkdir('build/images/misc');
        grunt.file.write('build/images/23012.test.png', 'foo');
        grunt.file.write('build/images/23012.bar.png', 'foo');
        grunt.file.write('build/images/misc/2a436.test.png', 'foo');
        grunt.file.copy(path.join(__dirname, 'fixtures/htmlprocessor_relative.html'), 'build/foo/index.html');

        grunt.log.muted = true;
        grunt.config.init();
        grunt.config('usemin', {html: 'build/foo/index.html'});
        grunt.task.run('usemin');
        grunt.task.start();

        var changed = grunt.file.read('build/foo/index.html');

        assert.ok(changed.match(/<img src="\.\.\/images\/23012\.test\.png">/));
        assert.ok(changed.match(/<link rel=\"stylesheet\" href=\"styles\/main\.min\.css\">/));
        assert.ok(changed.match(/<img src=\"\.\.\/images\/misc\/2a436\.test\.png\">/));

      });

    it('should take into account alternate path for assets', function () {
        grunt.file.mkdir('build');
        grunt.file.mkdir('foo');
        grunt.file.mkdir('foo/bar');
        grunt.file.mkdir('foo/images');
        grunt.file.mkdir('foo/images/foo');
        grunt.file.write('foo/images/23012.test.png', 'foo');
        grunt.file.write('foo/images/23012.bar.png', 'foo');
        grunt.file.write('foo/images/misc/2a436.test.png', 'foo');
        grunt.file.copy(path.join(__dirname, 'fixtures/htmlprocessor_relative.html'), 'build/index.html');

        grunt.log.muted = true;
        grunt.config.init();
        grunt.config('usemin', {html: 'build/index.html', options: { assetsDirs: ['foo/bar']}});
        grunt.task.run('usemin');
        grunt.task.start();

        var changed = grunt.file.read('build/index.html');

        assert.ok(changed.match(/<img src="\.\.\/images\/23012\.test\.png">/));
        assert.ok(changed.match(/<img src="\.\.\/images\/misc\/2a436\.test\.png">/));
      });

    it('should allow for several asset dirs', function () {
        grunt.file.mkdir('build');
        grunt.file.mkdir('foo/bar');
        grunt.file.mkdir('foo/images');
        grunt.file.mkdir('foo/images/misc');
        grunt.file.write('foo/images/23012.test.png', 'foo');
        grunt.file.write('foo/images/23012.bar.png', 'foo');
        grunt.file.write('foo/images/misc/2a436.test.png', 'foo');
        grunt.file.mkdir('bar');
        grunt.file.mkdir('bar/scripts');
        grunt.file.write('bar/scripts/12345.plugins.js', 'bar');
        grunt.file.write('bar/scripts/6789.amd-app.js', 'bar');
        grunt.file.copy(path.join(__dirname, 'fixtures/htmlprocessor_relative.html'), 'build/index.html');

        grunt.log.muted = true;
        grunt.config.init();
        grunt.config('usemin', {html: 'build/index.html',  options: { assetsDirs: ['foo/bar', 'bar']}});
        grunt.task.run('usemin');
        grunt.task.start();

        var changed = grunt.file.read('build/index.html');

        assert.ok(changed.match(/<img src="\.\.\/images\/23012\.test\.png">/));
        assert.ok(changed.match(/<img src="\.\.\/images\/misc\/2a436\.test\.png">/));
        assert.ok(changed.match(/<script src="scripts\/12345\.plugins\.js">/));
        assert.ok(changed.match(/<script data-main="scripts\/6789\.amd-app"/));

      });

  });

  before(directory('temp'));

  it('should work on CSS files', function () {
    grunt.file.mkdir('images');
    grunt.file.mkdir('images/misc');
    grunt.file.write('images/23012.test.png', 'foo');
    grunt.file.write('images/misc/2a436.test.png', 'foo');
    grunt.log.muted = true;
    grunt.config.init();
    grunt.config('usemin', {css: 'style.css'});
    grunt.file.copy(path.join(__dirname, 'fixtures/style.css'), 'style.css');
    grunt.task.run('usemin');
    grunt.task.start();

    var changed = grunt.file.read('style.css');

    // Check replace has performed its duty
    assert.ok(changed.match(/url\(\"images\/23012\.test\.png\"/));
    assert.ok(changed.match(/url\(\"images\/misc\/2a436\.test\.png\"/));
    assert.ok(changed.match(/url\(\"\/\/images\/23012\.test\.png\"/));
    assert.ok(changed.match(/url\(\"\/images\/23012\.test\.png\"/));
  });

  it('should not replace reference to file not revved', function () {
    grunt.file.write('foo.html', 'foo');
    grunt.file.write('bar-foo.html', 'foo');
    grunt.log.muted = true;
    grunt.config.init();
    grunt.config('usemin', {html: 'index.html'});
    grunt.file.copy(path.join(__dirname, 'fixtures/usemin.html'), 'index.html');
    grunt.task.run('usemin');
    grunt.task.start();

    var changed = grunt.file.read('index.html');

    // Check replace has performed its duty
    assert.ok(changed.match('<a href="foo.html"></a>'));
  });

  it('should consider that data-main point to a JS file', function () {
    grunt.file.mkdir('scripts');
    grunt.file.write('scripts/23012.main.js', 'foo');
    grunt.log.muted = true;
    grunt.config.init();
    grunt.config('usemin', {html: 'index.html'});
    grunt.file.copy(path.join(__dirname, 'fixtures/usemin.html'), 'index.html');
    grunt.task.run('usemin');
    grunt.task.start();

    var changed = grunt.file.read('index.html');

    // Check replace has performed its duty
    assert.ok(changed.match(/data-main="scripts\/23012\.main"/));
  });


  it('should use the furnished require.js source when replacing', function () {
    grunt.file.mkdir('scripts');
    grunt.file.write('scripts/23012.amd-app.js', 'foo');
    grunt.log.muted = true;
    grunt.config.init();
    grunt.config('usemin', {html: 'index.html'});
    grunt.file.copy(path.join(__dirname, 'fixtures/requirejs.html'), 'index.html');
    grunt.task.run('usemin');
    grunt.task.start();

    var changed = grunt.file.read('index.html');
    // Check replace has performed its duty
    assert.ok(changed.match(/data-main="scripts\/23012\.amd-app"\s+src="foo\/require\.js"/));

  });

  it('should allow for additional replacement patterns', function () {
    grunt.file.mkdir('images');
    grunt.file.write('images/2132.image.png', 'foo');
    grunt.log.muted = true;
    grunt.config.init();
    grunt.config('usemin', {
      js: 'misc.js',
      options: {
        assetsDirs: 'images',
        patterns: {
          js: [
            [/referenceToImage = '([^\']+)'/, 'Replacing image']
          ]
        }
      }
    });
    grunt.file.copy(path.join(__dirname, 'fixtures/misc.js'), 'misc.js');
    grunt.task.run('usemin');
    grunt.task.start();

    var changed = grunt.file.read('misc.js');

    // Check replace has performed its duty
    assert.ok(changed.match(/referenceToImage = '2132\.image\.png'/));
  });


});

describe('useminPrepare', function () {
  it('should update the config (HTML)', function () {
    grunt.log.muted = true;
    grunt.config.init();
    grunt.config('useminPrepare', {html: 'index.html'});
    grunt.file.copy(path.join(__dirname, 'fixtures/usemin.html'), 'index.html');
    grunt.task.run('useminPrepare');
    grunt.task.start();

    var concat = grunt.config('concat');

    assert.ok(concat);
    assert.ok(concat['.tmp/concat/scripts/plugins.js']);
    assert.equal(concat['.tmp/concat/scripts/plugins.js'].length, 13);
    assert.ok(concat['.tmp/concat/styles/main.min.css']);
    assert.equal(concat['.tmp/concat/styles/main.min.css'].length, 1);

    var requirejs = grunt.config('requirejs');
    assert.ok(requirejs.default.options.baseUrl);
    assert.equal(requirejs.default.options.baseUrl, 'scripts');
    assert.ok(requirejs.default.options.name);
    assert.equal(requirejs.default.options.name, 'main');
    assert.equal(requirejs.default.options.out, 'dist/scripts/amd-app.js');


    var uglify = grunt.config('uglify');
    assert.equal(uglify['dist/scripts/amd-app.js'], '.tmp/concat/scripts/amd-app.js');
    assert.equal(uglify['dist/scripts/plugins.js'], '.tmp/concat/scripts/plugins.js');
  });

  it('should use alternate search dir if asked to', function () {
    grunt.log.muted = true;
    grunt.config.init();
    grunt.config('useminPrepare', {html: 'index.html'});
    grunt.file.copy(path.join(__dirname, 'fixtures/alternate_search_path.html'), 'index.html');
    grunt.task.run('useminPrepare');
    grunt.task.start();

    var concat = grunt.config('concat');
    assert.ok(concat);
    assert.ok(concat['.tmp/concat/scripts/foo.js']);
    assert.equal(concat['.tmp/concat/scripts/foo.js'].length, 2);
    assert.equal(concat['.tmp/concat/scripts/foo.js'][0], 'build/scripts/bar.js');
    assert.equal(concat['.tmp/concat/scripts/foo.js'][1], 'build/scripts/baz.js');

    var uglify = grunt.config('uglify');
    assert.deepEqual(uglify['dist/scripts/foo.js'], ['.tmp/concat/scripts/foo.js']);
  });

  it('should update all requirejs multitask configs setting name and output', function () {
    grunt.log.muted = true;
    grunt.config.init();
    grunt.config('useminPrepare', {html: 'index.html'});
    grunt.config('requirejs', {
      task1: {},
      task2: {
        options: {
          baseUrl: 'base'
        }
      }
    });
    grunt.file.copy(path.join(__dirname, 'fixtures/usemin.html'), 'index.html');
    grunt.task.run('useminPrepare');
    grunt.task.start();

    var requirejs = grunt.config('requirejs');

    assert.ok(requirejs.task1.options.name);
    assert.ok(requirejs.task2.options.name);

    assert.equal(requirejs.task1.options.name, 'main');
    assert.equal(requirejs.task2.options.name, 'main');

    assert.equal(requirejs.task1.options.out, 'dist/scripts/amd-app.js');
    assert.equal(requirejs.task2.options.out, 'dist/scripts/amd-app.js');

    assert.equal(requirejs.task1.options.baseUrl, 'scripts');
    assert.equal(requirejs.task2.options.baseUrl, 'base');

    assert.equal(requirejs.task1.options.mainConfigFile, 'scripts/main.js');
    // assert.equal(requirejs.task2.options.mainConfigFile, 'base');
  });

  it('should handle correctly files in subdir (requirejs)', function () {
    grunt.log.muted = true;
    grunt.config.init();
    grunt.config('useminPrepare', {html: 'app/index.html'});
    grunt.config('requirejs', {
      task1: {}
    });
    grunt.file.mkdir('app');
    grunt.file.copy(path.join(__dirname, 'fixtures/usemin.html'), 'app/index.html');
    grunt.task.run('useminPrepare');
    grunt.task.start();

    var requirejs = grunt.config('requirejs');

    assert.ok(requirejs.task1.options);
    assert.ok(requirejs.task1.options.name);

    assert.equal(requirejs.task1.options.name, 'main');

    assert.equal(requirejs.task1.options.out, 'dist/scripts/amd-app.js');

    assert.equal(requirejs.task1.options.baseUrl, 'app/scripts');

    assert.equal(requirejs.task1.options.mainConfigFile, 'app/scripts/main.js');
  });

  it('should create a requirejs multitask config setting with name and output if non settings exists', function () {
    grunt.log.muted = true;
    grunt.config.init();
    grunt.config('useminPrepare', {html: 'index.html'});

    grunt.file.copy(path.join(__dirname, 'fixtures/usemin.html'), 'index.html');
    grunt.task.run('useminPrepare');
    grunt.task.start();

    var requirejs = grunt.config('requirejs');

    assert.ok(requirejs.default.options.name);
    assert.equal(requirejs.default.options.name, 'main');
    assert.equal(requirejs.default.options.out, 'dist/scripts/amd-app.js');
    assert.equal(requirejs.default.options.baseUrl, 'scripts');
  });

  it('output config for subsequent tasks (requirejs, concat, ..) should be relative to observed file', function () {
    grunt.log.muted = true;
    grunt.config.init();
    grunt.config('useminPrepare', {html: 'build/index.html'});
    grunt.file.mkdir('build');
    grunt.file.copy(path.join(__dirname, 'fixtures/relative_path.html'), 'build/index.html');
    grunt.task.run('useminPrepare');
    grunt.task.start();

    var concat = grunt.config('concat');
    assert.ok(concat);
    assert.ok(concat['.tmp/concat/scripts/foo.js']);
    assert.equal(concat['.tmp/concat/scripts/foo.js'].length, 2);

    var requirejs = grunt.config('requirejs');

    assert.ok(requirejs.default.options.baseUrl);
    assert.equal(requirejs.default.options.baseUrl, 'build/scripts');
    assert.ok(requirejs.default.options.name);
    assert.equal(requirejs.default.options.name, 'main');
    assert.equal(requirejs.default.options.out, 'dist/scripts/amd-app.js');

    var uglify = grunt.config('uglify');
    assert.deepEqual(uglify['dist/scripts/amd-app.js'], ['.tmp/concat/scripts/amd-app.js']);
    assert.deepEqual(uglify['dist/scripts/foo.js'], ['.tmp/concat/scripts/foo.js']);
  });

  it('should take dest option into consideration', function () {
    grunt.log.muted = true;
    grunt.config.init();
    grunt.config('useminPrepare', {html: 'index.html', options: { 'dest': 'foo'}});
    grunt.file.copy(path.join(__dirname, 'fixtures/usemin.html'), 'index.html');
    grunt.task.run('useminPrepare');
    grunt.task.start();

    var uglify = grunt.config('uglify');

    assert.equal(uglify['foo/scripts/amd-app.js'], '.tmp/concat/scripts/amd-app.js');
    assert.equal(uglify['foo/scripts/plugins.js'], '.tmp/concat/scripts/plugins.js');

  });

  it('should have configurable flow', function () {
    grunt.log.muted = true;
    grunt.config.init();
    grunt.config('useminPrepare', {
      html: 'index.html',
      options: {
        flow: {
          steps: ['uglifyjs'],
          post: []
        }
      }
    });
    grunt.file.copy(path.join(__dirname, 'fixtures/usemin.html'), 'index.html');
    grunt.task.run('useminPrepare');
    grunt.task.start();

    var uglify = grunt.config('uglify');
    var concat = grunt.config('concat');
    var requirejs = grunt.config('requirejs');

    assert.equal(concat, null);
    assert.equal(requirejs, null);
    assert.ok(uglify);

    assert.equal(uglify['dist/styles/main.min.css'], 'styles/main.css');

  });

  it('should have configurable flow per target', function () {
    grunt.log.muted = true;
    grunt.config.init();
    grunt.config('useminPrepare', {
      html: 'index.html',
      options: {
        flow: {
          'html': {
            steps: ['uglifyjs'],
            post: []
          }
        }
      }
    });
    grunt.file.copy(path.join(__dirname, 'fixtures/usemin.html'), 'index.html');
    grunt.task.run('useminPrepare');
    grunt.task.start();

    var uglify = grunt.config('uglify');
    var concat = grunt.config('concat');
    var requirejs = grunt.config('requirejs');

    assert.equal(concat, null);
    assert.equal(requirejs, null);
    assert.ok(uglify);

    assert.equal(uglify['dist/styles/main.min.css'], 'styles/main.css');

  });


  it('should allow use to furnish new steps of the flow', function() {
    var copy = {
        name: 'copy',
        createConfig: function(context,block) {
            var cfg = {};
            var inFiles = [];
            context.inFiles.forEach(function(file) { inFiles.push(path.join(context.inDir, file));});
            cfg[path.join(context.outDir, block.dest)] = inFiles;
            return cfg;
          }
      };
    grunt.log.muted = true;
    grunt.config.init();
    grunt.config('useminPrepare', {
      html: 'index.html',
      options: {
        flow: {
            steps: [copy],
            post: []
          }
        }
      });
    grunt.file.copy(path.join(__dirname, 'fixtures/usemin.html'), 'index.html');
    grunt.task.run('useminPrepare');
    grunt.task.start();

    var copyCfg = grunt.config('copy');

    assert.ok(copyCfg);
    assert.ok(copyCfg['dist/styles/main.min.css']);
    assert.ok(copyCfg['dist/scripts/plugins.js']);
    assert.ok(copyCfg['dist/scripts/amd-app.js']);

  });
});

