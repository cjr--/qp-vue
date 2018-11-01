require('qp-define');

var path = require('path');
var fs = require('fs');
var uglify = require('uglify-es');
var term = require('qp-library/term');

term.set_title('qp-vue - build');

var result = uglify.minify(
  fs.readFileSync(path.join(__dirname, 'qp-vue.js'), 'utf8'),
  { compress: { dead_code: false, unused: false } }
);

fs.writeFileSync(
  path.join(__dirname, 'qp-vue.min.js'),
  result.code
);

if (result.error) {
  console.log(result.error);
}
