define(module, function(exports, require) {

  var path = require('path');
  var qp = require('qp-utility');
  var fso = require('qp-library/fso');
  var fss = require('qp-library/fss');
  var vue_compiler = require('vue-template-compiler');
  var es6_transpile = require('vue-template-es2015-compiler');

  qp.module(exports, {

    ns: 'qp_vue',

    component: function(filepath, is_global) {
      var name = path.basename(filepath);
      var ns = this.get_namespace(filepath, name, is_global);
      var file = {
        tpl:  path.join(filepath, name + '.template.js'),
        vue:  path.join(filepath, name + '.vue'),
        html: path.join(filepath, name + '.html'),
        js:   path.join(filepath, name + '.js'),
        css:  path.join(filepath, name + '.css')
      };
      var assets = { files: { copy: [], merge: [ file.tpl, file.js, file.css ] } };
      if (fss.exists(file.vue)) {
        var parts = vue_compiler.parseComponent(fss.read(file.vue), { pad: false });
        this.create_template_file(ns, file.tpl, parts.template.content);
        fss.write(file.js, this.create_component_file(parts.script.content));
        fss.write(file.css, qp.ltrim(qp.map(parts.styles, style => style.content).join('\n')));
      } else if (fss.exists(file.html)) {
        this.create_template_file(ns, file.tpl, fss.read(file.html));
      }
      return assets;
    },

    create_template_file: function(ns, tpl_file, html) {
      var template = vue_compiler.compile(html);
      var compiled = qp.build(
        'module.exports(\'', ns, '\', {\n',
        '  render:function(){', template.render, '},\n',
        '  staticRenderFns:[', qp.map(template.staticRenderFns, (fn) => 'function(){' + fn + '}').join(), ']\n',
        '});\n'
      );
      var transpiled = '';
      try {
        transpiled = es6_transpile(compiled);
      } catch (error) {
        console.log(error.snippet);
        throw error;
      }
      fss.write(tpl_file, transpiled);
    },

    create_component_file: function(component) {
      var eol = '\n';
      return qp.build(
        'define(module, function(exports, require) {', eol,
        eol,
        '  var qp = require(\'qp-utility\');', eol,
        '  var vue = require(\'qp-vue\');',
        eol,
          qp.increase_indent(component),
        eol,
        '});', eol
      );
    },

    get_namespace: function(filepath, name, is_global) {
      if (is_global) {
        return name + '/template';
      } else {
        return 'component/' + qp.after(filepath, '/component/') + '/template';
      }
    }

  });

});
