'use strict';
var assert = require('assert');
var path = require('path');
var helpers = require('./helpers');
var File = require('../lib/file');
var FileProcessor = require('../lib/fileprocessor.js');

describe('FileProcessor', function() {
	describe('constructor', function() {
		it('should fail if no pattern is furnished', function() {
			assert.throws(function() {
				new FileProcessor();
			}, /No pattern given/);
		});

		it('should accept a pattern name', function() {
			var fp = new FileProcessor('html', {});
			assert.ok(fp);
		});

		it('should access a pattern object', function() {
			var foo = {foo: 'bar'};
			var fp = new FileProcessor(foo, {});
			assert.ok(fp);			
			assert.deepEqual(fp.patterns, foo);
		});

		it('should fail if pattern name is not known', function() {
			assert.throws(function() {
				new FileProcessor('foo');t 
			}, /Unsupported pattern: foo/);
		});

		it('should check all needed arguments are furnished', function() {
			assert.throws(function() {
				new FileProcessor('html');
			},
			/Missing parameter: finder/);
		});
	});

	describe('replaceBlocks', function(){
		it('should replace block with the right expression', function() {
			var fp = new FileProcessor('html',{});
			fp.replaceWith = function(block) { return 'foo'};
			var file = {
				content: 'foo\nbar\nbaz\n',
				blocks: [
				{
					raw: ['bar', 'baz'],
				}]
			};
			var result = fp.replaceBlocks(file);
			assert.equal(result, 'foo\nfoo\n');
		});
	});

	describe('replaceWith', function() {
		it('should replace css blocks with a link to a stylesheet', function() {
			var fp = new FileProcessor('html',{});
			var block = {
				dest: 'foo.css',
				type: 'css',
				indent: '  '
			};

			var result = fp.replaceWith(block);
			assert.equal(result, '  <link rel="stylesheet" href="foo.css">')
		});

		it('should replace js blocks with a link to a javascript file', function() {
			var fp = new FileProcessor('html',{});
			var block = {
				dest: 'foo.js',
				type: 'js',
				indent: '  '
			};

			var result = fp.replaceWith(block);
			assert.equal(result, '  <script src="foo.js"><\/script>')
		});

		it('should replace requirejs blocks with a link to a javascript file', function() {
			var fp = new FileProcessor('html',{});
			var block = {
				dest: 'foo.js',
				type: 'js',
				requirejs: {
					dest: 'main',
					src: 'require.js'
				},
				indent: '  '
			};

			var result = fp.replaceWith(block);
			assert.equal(result, '  <script data-main="main" src="require.js"><\/script>')
		});

	});

	describe('replaceWithRevved', function() {
		it('should use furnished pattern to replace match with reference to revved files', function() {
			var pattern = [[
				/(foo\d+)/g,
				'Replaced numerical foo'
			]];

			var finder = { find: function() { return 'toto'; }};
			var fp = new FileProcessor(pattern, finder);
			var content = 'bar\nfoo12345\nfoo8979\nbaz\n';
			var result = fp.replaceWithRevved(content,['']);

			assert.equal(result, 'bar\ntoto\ntoto\nbaz\n');
		});
		// FIXME: add tests on the filterIn / filterOut stuff
	});

	describe('process', function() {
		// FIXME: mock File
		// it('should parse file if a filename is furnished', function(done){
		// 	var File = function(filename) {
		// 		assert.equal(filename, 'foo')
		// 	};
		// 	var fp = new FileProcessor('html', {});
		// 	fp.process('foo');

		// });
		it('should call replaceWithRevved with the right arguments', function() {

		});
	});

	describe('html type', function() {
		var fp;
		var filemapping = {
		    'foo.js': '1234.foo.js',
		    '/foo.js': '/1234.foo.js',
		    'app/bar.css': '5678.bar.css',
		    'app/baz.css': '/8910.baz.css',
		    'app/image.png': '1234.image.png',
		    'tmp/bar.css': '1234.bar.css',
		    'app/foo.js': '1234.foo.js',
		    '/styles/main.css': '/styles/1234.main.css'
		};

		var revvedfinder = helpers.makeFinder(filemapping);

		beforeEach(function() {
			fp = new FileProcessor('html', revvedfinder);

		});
	    it('should not replace file if no revved version is found', function () {
	      var content = '<script src="bar.js"></script>';
	      var replaced = fp.replaceWithRevved(content, ['app']);
	      assert.equal(replaced, '<script src="bar.js"></script>');
	    });

	    it('should not treat file reference that are coming from templating', function () {
	      var content = '<script src="<% my_func() %>"></script>';
	      var replaced = fp.replaceWithRevved(content, ['app']);
	      assert.equal(replaced, '<script src="<% my_func() %>"></script>');
	    });

	    it('should not replace external references', function () {
	      var content = '<script src="http://bar/foo.js"></script>';
	      var replaced = fp.replaceWithRevved(content, ['app']);
	      assert.equal(replaced, '<script src="http://bar/foo.js"></script>');
	    });

	    it('should not add .js to data-main for requirejs', function () {
	      var content = '<script data-main="bar" src="require.js"></script>';
	      var replaced = fp.replaceWithRevved(content, ['app']);
	      assert.equal(replaced, '<script data-main="bar" src="require.js"></script>');
	    });



	    describe('absolute paths', function () {
	      var fp;

	      beforeEach(function() {
			fp = new FileProcessor('html', revvedfinder);
	      });

	      it('should replace file referenced from root', function () {
	        var replaced = fp.replaceWithRevved('<link rel="stylesheet" href="/styles/main.css">', ['']);
	        assert.equal(replaced, '<link rel="stylesheet" href="/styles/1234.main.css">');
	      });

	      it('should not replace the root (i.e /)', function () {
	        var content = '<script src="/"></script>';
	        var replaced = fp.replaceWithRevved(content, ['']);

	        assert.equal(replaced, '<script src="/"></script>');
	      });

	      it('should replace accept additional parameters to script', function () {
	        var content = '<script src="foo.js" type="text/javascript"></script>';
	        var replaced = fp.replaceWithRevved(content, ['']);
	        assert.equal(replaced, '<script src="' + filemapping['foo.js'] + '" type="text/javascript"></script>');
	      });

	      it('should allow for several search paths', function () {
	        var content = '<script src="foo.js" type="text/javascript"></script><link rel="stylesheet" href="/baz.css">';
	        var replaced = fp.replaceWithRevved(content, ['app', 'tmp']);

	        assert.ok(replaced.match(/<link rel="stylesheet" href="\/8910\.baz\.css">/));
	        assert.ok(replaced.match(/<script src="1234\.foo\.js" type="text\/javascript"><\/script>/));
	      });
	    });

	    describe('relative paths', function () {
	      var fp;

	      beforeEach(function() {
			fp = new FileProcessor('html', revvedfinder);
	      });

	      it('should replace script source with revved version', function () {
	        var content = '<script src="foo.js"></script>';
	        var replaced = fp.replaceWithRevved(content, ['']);
	        assert.equal(replaced, '<script src="' + filemapping['foo.js'] + '"></script>');
	      });
	      it('should replace accept additional parameters to script', function () {
	        var content = '<script src="foo.js" type="text/javascript"></script>';
	        var replaced = fp.replaceWithRevved(content, ['']);
	        assert.equal(replaced, '<script src="' + filemapping['foo.js'] + '" type="text/javascript"></script>');
	      });

	    });

	    it('should replace CSS reference with revved version', function () {
	      var content = '<link rel="stylesheet" href="bar.css">';
	      var replaced = fp.replaceWithRevved(content, ['app']);
	      assert.equal(replaced, '<link rel="stylesheet" href="5678.bar.css">');
	    });

	    it('should replace img reference with revved version', function () {
	      var content = '<img src="image.png">';
	      var replaced = fp.replaceWithRevved(content, ['app']);
	      assert.equal(replaced, '<img src="' + filemapping['app/image.png'] + '">');
	    });

	    it('should replace data reference with revved version', function () {
	      var content = '<li data-lang="fr" data-src="image.png"></li>';
	      var replaced = fp.replaceWithRevved(content, ['app']);
	      assert.equal(replaced, '<li data-lang="fr" data-src="' + filemapping['app/image.png'] + '"></li>');
	    });

	    it('should replace image reference in inlined style', function () {
	      var content = '<li style="background: url("image.png");"></li>';
	      var replaced = fp.replaceWithRevved(content, ['app']);
	      assert.equal(replaced, '<li style="background: url("' + filemapping['app/image.png'] + '");"></li>');
	    });

	    it('should replace image reference in anchors', function () {
	      var content = '<a href="image.png"></a>';
	      var replaced = fp.replaceWithRevved(content, ['app']);
	      assert.equal(replaced, '<a href="' + filemapping['app/image.png'] + '"></a>');
	    });

	    it('should replace image reference in input', function () {
	      var content = '<input type="image" src="image.png" />';
	      var replaced = fp.replaceWithRevved(content, ['app']);
	      assert.equal(replaced, '<input type="image" src="' + filemapping['app/image.png'] + '" />');
	    });
	});

	describe('css type', function() {
		var cp;

	    describe('absolute path', function() {
	      	var content = '.myclass {\nbackground: url("/images/test.png") no-repeat center center;\nbackground: url("/images/misc/test.png") no-repeat center center;\nbackground: url("//images/foo.png") no-repeat center center;}';
			var filemapping = {
		        'build/images/test.png': '/images/23012.test.png',
		        'build/images/foo.png': '//images/23012.foo.png',
		        'build/images/misc/test.png': '/images/misc/23012.test.png',
		        'foo/images/test.png': '/images/23012.test.png',
		        'foo/images/foo.png': '//images/23012.foo.png',
		        'foo/images/misc/test.png': '/images/misc/23012.test.png'
			};

			var revvedfinder = helpers.makeFinder(filemapping);

		    beforeEach(function() {
				cp = new FileProcessor('css', revvedfinder);
		    });

		    it('should replace with revved files when found', function(){
		      var changed = cp.replaceWithRevved(content,['build']);

		      assert.ok(changed.match(/\/images\/23012\.test\.png/));
		      assert.ok(changed.match(/\/images\/misc\/23012\.test\.png/));
		      assert.ok(changed.match(/\/\/images\/23012\.foo\.png/));
		    });

		    it('should take into account alternate search paths', function(){
		      var changed = cp.replaceWithRevved(content, ['foo']);

		      assert.ok(changed.match(/\/images\/23012\.test\.png/));
		      assert.ok(changed.match(/\/images\/misc\/23012\.test\.png/));
		      assert.ok(changed.match(/\/\/images\/23012\.foo\.png/));

		    });

	    });

	    describe('relative path', function() {
	      	var content = '.myclass {\nbackground: url("images/test.png") no-repeat center center;\nbackground: url("../images/misc/test.png") no-repeat center center;\nbackground: url("images/foo.png") no-repeat center center;}';
			var filemapping = {
		        'build/images/test.png': 'images/23012.test.png',
		        'build/images/foo.png': 'images/23012.foo.png',
		        'images/misc/test.png': '../images/misc/23012.test.png',
		        'foo/images/test.png': 'images/23012.test.png',
		        'foo/images/foo.png': 'images/23012.foo.png',
			};

			var revvedfinder = helpers.makeFinder(filemapping);

		    beforeEach(function() {
				cp = new FileProcessor('css', revvedfinder);
		    });

		    it('should replace with revved files when found', function(){
		      var changed = cp.replaceWithRevved(content, ['build']);

		      assert.ok(changed.match(/\"images\/23012\.test\.png/));
		      assert.ok(changed.match(/\"\.\.\/images\/misc\/23012\.test\.png/));
		      assert.ok(changed.match(/\"images\/23012\.foo\.png/));
		    });

		    it('should take into account alternate search paths', function(){
		      var changed = cp.replaceWithRevved(content, ['foo']);

		      assert.ok(changed.match(/\"images\/23012\.test\.png/));
		      assert.ok(changed.match(/\"\.\.\/images\/misc\/23012\.test\.png/));
		      assert.ok(changed.match(/\"images\/23012\.foo\.png/));

		    });

	    });
	});
});