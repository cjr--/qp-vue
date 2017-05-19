define(module, function(exports, require, make) {

  var qp = require('qp-utility');
  var vue = require('vue');

  exports({

    ns: 'qp-vue',

    register: function(view, vm) {
      vue.component(vm.name, qp.assign(vm, view));
    }

  });

});
