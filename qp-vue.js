define(module, function(exports, require) {

  var qp = require('qp-utility');

  var Vue = require('Vue');
  var Vuex = require('Vuex');
  var VueRouter = require('VueRouter');

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

    use: function(plugin) {
      Vue.use(plugin);
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

    extend: function(o) {
      o.name = qp.split(o.ns, '/').pop();
      qp.assign(o, require(o.ns + '/template'));
      return Vue.extend(o);
    },

    /* Vuex */

    store: function(o) {
      Vue.use(Vuex);
      if (o.mixins) {
        qp.each(o.mixins, function(mixin) {
          if (mixin) {
            o.state = qp.assign(o.state, mixin.state);
            o.getters = qp.assign(o.getters, mixin.getters);
            o.mutations = qp.assign(o.mutations, mixin.mutations);
            o.actions = qp.assign(o.actions, mixin.actions);
          }
        }.bind(this));
      }
      return exports(o.ns, new Vuex.Store(o));
    },

    map_state: function() { return Vuex.mapState.apply(null, arguments); },
    map_getters: function() { return Vuex.mapGetters.apply(null, arguments); },
    map_actions: function() { return Vuex.mapActions.apply(null, arguments); },
    map_mutations: function() { return Vuex.mapMutations.apply(null, arguments); }

  });

});
