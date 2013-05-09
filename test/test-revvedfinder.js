'use strict';
var assert = require('assert');
var RevvedFinder = require('../lib/revvedfinder');
var expandfn = function () {
  return [];
};

describe('RevvedFinder', function () {
  it('should initialize correctly', function () {
    var rf = new RevvedFinder(expandfn);
    assert.equal(expandfn, rf.expandfn);
  });

  it('should allow for a mapping or and expandfn');

  describe('expand function', function() {

    describe('find', function () {
      it('should return the file if it\'s external', function () {
        var rf = new RevvedFinder(expandfn);
        var rfile = rf.find('http://foo/bar.png');
        assert.equal('http://foo/bar.png', rfile);
      });

      it('should return the file if it references nothing', function () {
        var rf = new RevvedFinder(expandfn);
        var rfile = rf.find('');
        assert.equal('', rfile);
      });

      it('should return revved version of the given file', function () {
        var rf = new RevvedFinder(function () {
          return ['./2345.image.png'];
        });
        var rfile = rf.find('image.png', '.');
        assert.equal('2345.image.png', rfile );
      });

      // it('should pay attention to the full given path', function () {
      //   var rf = new RevvedFinder(function () {
      //     return ['./foo/bar/7345.image.png', './bar/2345.image.png'];
      //   });
      //   var rfile = rf.find('bar/image.png', '.');
      //   assert.equal(rfile, 'bar/2345.image.png');

      //   rf = new RevvedFinder(function () {
      //     return ['temp/7345.image.png', 'temp/bar/2345.image.png', 'temp/bar/baz/1234.image.png'];
      //   });
      //   var rfile = rf.find('bar/image.png', ['temp']);
      //   assert.equal('bar/2345.image.png', rfile);
      // });

      it('should regexp quote the looked-after file', function (done) {
        var rf = new RevvedFinder(function (pattern) {
          assert.equal('*.image.png', pattern);
          done();
          return [];
        });
        rf.find('image.png', '.');
      });

      it('should return revved version if it ends hex in characters', function () {
        var rf = new RevvedFinder(function () {
          return ['11916fba.image.png'];
        });
        var rfile = rf.find('image.png', '.');
        assert.equal(rfile, '11916fba.image.png');

      });

      it('should return the file if no revved version is found', function () {
        var rf = new RevvedFinder(function () {
          return [];
        });
        var rfile = rf.find('foo.png', '.');
        assert.equal(rfile, 'foo.png');
      });

      // it('should return the file if not revved version is found (starting from root)', function () {
      //   var rf = new RevvedFinder(function () {
      //     return [];
      //   });
      //   assert.equal('/foo.png', rf.find('/foo.png', '.'));
      // });

      // it('should pay attention to the file starting at root', function () {
      //   var rf = new RevvedFinder(function () {
      //     return ['1234.foo.png'];
      //   });
      //   assert.equal('/1234.foo.png', rf.find('/foo.png', '.'));
      // });

      describe('absolute paths', function() {
        it('should return the revved file', function() {
          var rf = new RevvedFinder(function () {
            return ['bar/baz/1234.foo.png'];
          });
          var rfile = rf.find('/foo.png', 'bar/baz');
          assert.equal(rfile, '/1234.foo.png');
        });

        it('should look for the file in furnished search path', function() {
          var rf = new RevvedFinder(function () {
            return ['temp/bar/2345.image.png'];
          });
          var rfile = rf.find('/bar/image.png', ['temp']);
          assert.equal('/bar/2345.image.png', rfile);
        });

        it('should allow for several seach paths', function() {
          var rf = new RevvedFinder(function () {
            return ['foo/bar/2345.image.png'];
          });
          var rfile = rf.find('/bar/image.png', ['temp', 'foo']);
          assert.equal('/bar/2345.image.png', rfile);
        });
      });

      it('should only look under the furnished directory', function () {
        var rf = new RevvedFinder(function (pattern) {
          assert.equal(pattern, 'bar/*.fred.html');
          return ['fred.html'];
        });
        var rfile = rf.find('fred.html', 'bar');
        assert.equal(rfile, 'fred.html');
      });


      it('should only look at revved files', function () {
        var rf = new RevvedFinder(function () {
          return ['bar-fred.html'];
        });
        var rfile = rf.find('fred.html', '.');
        assert.equal(rfile, 'fred.html');
      });

      // it('should restrict to the furnished subdirectories', function () {
      //   var rf = new RevvedFinder(function (pattern) {
      //     assert.equal(pattern, '{temp,dist}/**/*fred\\.html');
      //     return ['fred.html'];
      //   });
      //   rf.find('fred.html', '.');
      // });

      // it('should allow for a list of search paths', function() {
      //   var rf = new RevvedFinder(function (pattern) {
      //     assert.equal(pattern, '{temp,dist}/**/./*fred\\.html');
      //     return ['temp/./fred.html'];
      //   });
      //   var rfile = rf.find('fred.html', ['temp', 'dist']);
      //   assert.equal(rfile, 'temp/fred.html' );
      // });

      // it('should normalize relative paths', function() {
      //   var rf = new RevvedFinder(function (pattern) {
      //     // assert.equal(pattern, 'temp/**/images/*fred\\.html');
      //     // FIXME: We should match the above not the bellow
      //     assert.equal(pattern, 'temp/foo/**/../images/*fred\\.html');
      //     return ['fred.html'];
      //   });
      //   var rfile = rf.find('../images/fred.html', ['temp/foo']);
      //   assert.equal(rfile.base, '' );
      // });

      it('should return matching file as well as base directory', function() {
        var rf = new RevvedFinder(function () {
          return ['temp/./2323.fred.html'];
        });
        var rfile = rf.find('fred.html', ['temp', 'dist']);
        assert.equal(rfile, '2323.fred.html');

        rf = new RevvedFinder(function () {
          return ['dist/bar/../2323.fred.html'];
        });
        rfile = rf.find('../fred.html', ['temp/foo', 'dist/bar']);
        assert.equal(rfile, '../2323.fred.html');

        rf = new RevvedFinder(function () {
          return ['dist/bar/1234.test.png', 'dist/bar/images/1234.test.png'];
        });
        rfile = rf.find('images/test.png', ['temp/foo', 'dist/bar']);
        assert.equal(rfile, 'images/1234.test.png');

        rf = new RevvedFinder(function () {
          return ['dist/bar/../1234.test.png', 'dist/bar/../images/1234.test.png'];
        });
        rfile = rf.find('../images/test.png', ['temp/foo', 'dist/bar']);
        assert.equal(rfile, '../images/1234.test.png');

        rf = new RevvedFinder(function () {
          return ['dist/bar/images/1234.test.png', 'dist/bar/images/misc/1234.test.png'];
        });
        rfile = rf.find('images/misc/test.png', ['temp/foo', 'dist/bar']);
        assert.equal(rfile, 'images/misc/1234.test.png');
      });

      it('should return the path under which the file has been found');
    });

    describe('mapping', function() {
      describe('relative paths', function() {
        it('should return the corresponding file', function() {
          var rf = new RevvedFinder({'dist/images/misc/test.png': 'dist/images/misc/34546.test.png'});
          var file = rf.find('images/misc/test.png', ['temp', 'dist']);
          assert.equal(file, 'images/misc/34546.test.png');
        });

        it('should handle correctly complicated relative paths', function() {
          var rf = new RevvedFinder({'images/misc/test.png': 'images/misc/34546.test.png'});
          var file = rf.find('../../images/misc/test.png', ['temp/foo', 'dist/bar']);
          assert.equal(file, '../../images/misc/34546.test.png');
        });

      });
      describe('absolute paths', function() {
        it('should return the corresponding file', function() {
          var rf = new RevvedFinder({'dist/images/misc/test.png': 'dist/images/misc/34546.test.png'});
          var file = rf.find('/images/misc/test.png', ['temp', 'dist']);
          assert.equal(file, '/images/misc/34546.test.png');
        });
      });
    });

  });
});
