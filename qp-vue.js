define(module, function(exports, require, make) {

  var qp = require('qp-utility');
  var Vue = require('vue');
  var Vuex = require('vuex');
  var VueRouter = require('vue-router');

  Vue.config.productionTip = false;

  exports({

    ns: 'qp-vue',

    create: function(o) {
      qp.ready(function() { new Vue(o); });
    },

    store: function(o) {
      Vue.use(Vuex);
      return new Vuex.Store(o);
    },

    router: function(o) {
      Vue.use(VueRouter);
      return new VueRouter(qp.options(o, {
        mode: 'history'
      }));
    },

    register: function(view, vm) {
      Vue.component(vm.name, qp.assign(vm, view));
    },

    template: function(component) {
      return function(h) { return h(component); };
    }

  });

});
