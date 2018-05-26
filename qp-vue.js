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
        o.render = (h) => h(component_name)
      }
      var vue = new Vue(o);
      qp.ready(() => vue.$mount('#main'));
    },

    use: function(plugin) {
      Vue.use(plugin);
    },

    extend: function(o) {
      if (o.computed ) {
        if (o.computed.map_getters) qp.assign(o.computed, Vuex.mapGetters(qp.delete_key(o.computed, 'map_getters', {})));
        if (o.computed.map_state) qp.assign(o.computed, Vuex.mapState(qp.delete_key(o.computed, 'map_state', {})));
      }
      if (o.methods) {
        if (o.methods.map_actions) qp.assign(o.methods, Vuex.mapActions(qp.delete_key(o.methods, 'map_actions', {})));
        if (o.methods.map_mutations) qp.assign(o.methods, Vuex.mapMutations(qp.delete_key(o.methods, 'map_mutations', {})));
      }
      qp.assign(o, qp.pick(require(o.ns + '/template'), 'render', 'staticRenderFns'));
      var ctor = Vue.extend(o);
      ctor.options.name = qp.split(o.ns, '/').pop();
      return exports(o.ns, ctor);
    },

    /* Vuex */

    store: function(o) {
      Vue.use(Vuex);
      qp.each(qp.delete_key(o, 'mixins'), (mixin) => {
        qp.assign(o.state, mixin.state);
        qp.assign(o.getters, mixin.getters);
        qp.assign(o.mutations, mixin.mutations);
        qp.assign(o.actions, mixin.actions);
      });
      return exports(o.ns, new Vuex.Store(o));
    },

    /* VueRouter */

    router: function(o) {
      Vue.use(VueRouter);
      var router = new VueRouter({ mode: 'history', routes: o.routes });
      if (o.beforeFirst) {
        router.beforeEach((to, from, next) => {
          if (!router.app_initialised) {
            router.app_initialised = true;
            o.beforeFirst(to, from, next);
          } else { next(); }
        });
      }
      if (o.beforeEach) router.beforeEach(o.beforeEach);
      if (o.beforeResolve) router.beforeResolve(o.beforeResolve);
      if (o.afterEach) router.afterEach(o.afterEach);
      return exports(o.ns, router);
    }

  });

});
