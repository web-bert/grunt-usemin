'use strict';
var path = require('path');

exports.name = 'concat';

//
// Output a config for the furnished block
// The context variable is used both to take the files to be treated
// (inFiles) and to output the one(s) created (outFiles).
// It aslo conveys whether or not the current process is the last of the pipe
//
exports.createConfig = function(context, block) {
  var cfg = {};
  // FIXME: check context has all the needed info
  var outfile = path.join(context.outDir, block.dest);

  // Depending whether or not we're the last of the step we're not going to output the same thing
  cfg[outfile] = [];
  context.inFiles.forEach(function(f) { cfg[outfile].push(path.join(context.inDir, f));} );
  context.outFiles = [block.dest];
  return cfg;
};
