define(module, function(exports, require) {

  var qp = require('qp-utility');
  var Vue = require('vue');
  var Vuex = require('vuex');
  var VueRouter = require('vue-router');

  Vue.config.productionTip = false;

  exports({

    ns: 'qp-vue',

    create: function(o) {
      qp.ready(function() {
        if (qp.is(o.render, 'string')) {
          var component_name = o.render;
          o.render = function(h) { return h(component_name); };
        }
        var vue = new Vue(o);
        vue.$mount('#main');
      });
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
      var data = o.data;
      o.data = function() { return qp.clone(data); };
      qp.assign(o, qp.delete(require(o.ns + '/template'), 'ns'));
      o.name = qp.after(o.ns, 'component/');
      return exports(o.ns, Vue.extend(o));
    },

    register: function(o) {
      var id = qp.delete_key(o, 'ns');
      var data = o.data;
      o.data = function() { return qp.clone(data); };
      qp.assign(o, qp.delete(require(id + '/template'), 'ns'));
      Vue.component(id, o);
    }

  });

});
