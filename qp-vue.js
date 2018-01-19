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
      if (o.store) o.created = function() { this.$store.dispatch('initialise'); };
      this.create_store_route(o.store, o.router);
      var vue = new Vue(o);
      qp.ready(function() { vue.$mount('#main'); });
    },

    use: function(plugin) {
      Vue.use(plugin);
    },

    make: function(o) {
      var ns = o.ns;
      if (o.computed ) {
        if (o.computed.map_getters) qp.assign(o.computed, Vuex.mapGetters(qp.delete_key(o.computed, 'map_getters', {})));
        if (o.computed.map_state) qp.assign(o.computed, Vuex.mapState(qp.delete_key(o.computed, 'map_state', {})));
      }
      if (o.methods) {
        if (o.methods.map_actions) qp.assign(o.methods, Vuex.mapActions(qp.delete_key(o.methods, 'map_actions', {})));
        if (o.methods.map_mutations) qp.assign(o.methods, Vuex.mapMutations(qp.delete_key(o.methods, 'map_mutations', {})));
      }
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
