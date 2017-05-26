define(module, function(exports, require) {

  var qp = require('qp-utility');
  var Vue = require('vue');
  var Vuex = require('vuex');
  var VueRouter = require('vue-router');

  Vue.config.productionTip = false;

  qp.module(exports, {

    ns: 'qp-vue',

    create: function(o) {
      if (qp.is(o.render, 'string')) {
        var component_name = o.render;
        o.render = function(h) { return h(component_name); };
      }
      var vue = new Vue(o);
      qp.ready(function() { vue.$mount('#main'); });
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

    make: function(o) {
      var ns = o.ns;
      return exports(ns, this.extend(o));
    },

    register: function(id, o) {
      if (qp.is(o, 'function')) {
        Vue.component(id, o);
      } else {
        Vue.component(id, this.extend(o));
      }
    },

    extend: function(o) {
      var data = o.data || {};
      o.data = function() { return qp.clone(data); };
      o.name = qp.after(o.ns, 'component/');
      qp.assign(o, qp.delete(require(o.ns + '/template'), 'ns'));
      return Vue.extend(o);
    }

  });

});
