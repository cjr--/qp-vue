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
      this.create_store_route(o.store, o.router);
      var vue = new Vue(o);
      qp.ready(function() {
        vue.$mount('#main');
        vue.$store.dispatch('initialise');
      });
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
      return new VueRouter(qp.options(o, {
        mode: 'history'
      }));
    },

    /* Vuex - VueRouter - Sync */

    // https://github.com/vuejs/vuex-router-sync
    create_store_route: function(store, router) {
      if (store && router) {
        var is_time_traveling = false;
        var currentPath = null;

        store.registerModule('route', {
          namespaced: true,
          state: clone_route(router.currentRoute),
          mutations: {
            route_changed: (state, transition) => store.state.route = clone_route(transition.to, transition.from)
          }
        });

        var unwatch = store.watch(
          (state) => state['route'],
          (route) => {
            var fullPath = route.fullPath;
            if (fullPath === currentPath) return;
            if (currentPath != null) {
              is_time_traveling = true;
              router.push(route);
            }
            currentPath = fullPath;
          },
          { sync: true }
        );

        var unhook = router.afterEach((to, from) => {
          if (is_time_traveling) {
            is_time_traveling = false;
            return;
          }
          currentPath = to.fullPath;
          store.commit('route/route_changed', { to: to, from: from });
        });

        function clone_route(to, from) {
          var clone = { name: to.name, path: to.path, hash: to.hash, query: to.query, params: to.params, fullPath: to.fullPath, meta: to.meta }
          if (from) clone.from = clone_route(from)
          return Object.freeze(clone)
        }

        function destroy_store_route() {
          if (unhook) unhook();
          if (unwatch) unwatch();
          store.unregisterModule('route');
        }
      }
    }

  });

});
