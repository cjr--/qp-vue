define(module, function(exports, require) {

  var qp = require('qp-utility');
  var Vue = require('vue');
  var Vuex = require('vuex');
  var VueRouter = require('vue-router');

  Vue.config.productionTip = false;

  function clone_state(state) {
    if (qp.is(state, 'undefined')) {
      return function() { return {}; };
    } else if (qp.is(state, 'function')) {
      return state;
    } else {
      return function() { return qp.clone(state); };
    }
  }

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
      o.data = clone_state(o.data);
      o.name = qp.after(o.ns, 'component/');
      qp.assign(o, require(o.ns + '/template'));
      return Vue.extend(o);
    },

    /* Vuex */

    store: function(o) {
      Vue.use(Vuex);
      if (o.mixins) {
        qp.each(o.mixins, (mixin) => {
          o.state = qp.assign(o.state, mixin.state);
          o.getters = qp.assign(o.getters, mixin.getters);
          o.mutations = qp.assign(o.mutations, mixin.mutations);
          o.actions = qp.assign(o.actions, mixin.actions);
        });
      }
      return exports(o.ns, new Vuex.Store(o));
    },

    map_state: function() { return Vuex.mapState.apply(null, arguments); },
    map_getters: function() { return Vuex.mapGetters.apply(null, arguments); },
    map_actions: function() { return Vuex.mapActions.apply(null, arguments); },
    map_mutations: function() { return Vuex.mapMutations.apply(null, arguments); }

  });

});
