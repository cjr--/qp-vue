define(module, function(exports, require) {

  var path = require('path');
  var qp = require('qp-utility');
  var fso = require('qp-library/fso');
  var fss = require('qp-library/fss');
  var vue_compiler = require('vue-template-compiler');
  var es6_transpile = require('vue-template-es2015-compiler');

  exports({

    ns: 'qp_vue',

    component: function(filepath, is_global) {
      var assets = {
        files: { copy: [], merge: [ ] }
      };

      var name = path.basename(filepath);
      if (fss.exists(filepath, name + '.html')) {
        var ns;
        if (is_global) {
          ns = name + '/template';
        } else {
          ns = 'component/' + qp.after(filepath, '/component/') + '/template';
        }

        var tpl_file = path.join(filepath, name + '.template.js');
        assets.files.merge.push(tpl_file);
        assets.files.merge.push(path.join(filepath, name + '.css'));
        assets.files.merge.push(path.join(filepath, name + '.js'));

        var template = vue_compiler.compile(fss.read(path.join(filepath, name + '.html')));
        var compiled = qp.build(
          'module.exports(\'', ns, '\', {\n',
          '  render:function(){', template.render, '},\n',
          '  staticRenderFns:[', qp.map(template.staticRenderFns, (fn) => 'function(){' + fn + '}').join(), ']\n',
          '});\n'
        );
        fss.write(tpl_file, es6_transpile(compiled));
      }

      return assets;
    }

  });

});
