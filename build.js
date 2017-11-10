var path = require('path');
var fs = require('fs');
var uglify = require('uglify-js');

var result = uglify.minify(
  fs.readFileSync(path.join(__dirname, 'qp-vue.js'), 'utf8'),
  { compress: { dead_code: false, unused: false } }
);

fs.writeFileSync(
  path.join(__dirname, 'qp-vue.min.js'),
  result.code
);

console.log(result.error);
