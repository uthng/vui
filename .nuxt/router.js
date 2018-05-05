import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const _233a66aa = () => import('../pages/logout.vue' /* webpackChunkName: "pages/logout" */).then(m => m.default || m)
const _554e188c = () => import('../pages/kv.vue' /* webpackChunkName: "pages/kv" */).then(m => m.default || m)
const _78d116d8 = () => import('../pages/login.vue' /* webpackChunkName: "pages/login" */).then(m => m.default || m)
const _a1ad187e = () => import('../pages/index.vue' /* webpackChunkName: "pages/index" */).then(m => m.default || m)



if (process.client) {
  window.history.scrollRestoration = 'manual'
}
const scrollBehavior = function (to, from, savedPosition) {
  // if the returned position is falsy or an empty object,
  // will retain current scroll position.
  let position = false

  // if no children detected
  if (to.matched.length < 2) {
    // scroll to the top of the page
    position = { x: 0, y: 0 }
  } else if (to.matched.some((r) => r.components.default.options.scrollToTop)) {
    // if one of the children has scrollToTop option set to true
    position = { x: 0, y: 0 }
  }

  // savedPosition is only available for popstate navigations (back button)
  if (savedPosition) {
    position = savedPosition
  }

  return new Promise(resolve => {
    // wait for the out transition to complete (if necessary)
    window.$nuxt.$once('triggerScroll', () => {
      // coords will be used if no selector is provided,
      // or if the selector didn't match any element.
      if (to.hash) {
        let hash = to.hash
        // CSS.escape() is not supported with IE and Edge.
        if (typeof window.CSS !== 'undefined' && typeof window.CSS.escape !== 'undefined') {
          hash = '#' + window.CSS.escape(hash.substr(1))
        }
        try {
          if (document.querySelector(hash)) {
            // scroll to anchor by returning the selector
            position = { selector: hash }
          }
        } catch (e) {
          console.warn('Failed to save scroll position. Please add CSS.escape() polyfill (https://github.com/mathiasbynens/CSS.escape).')
        }
      }
      resolve(position)
    })
  })
}


export function createRouter () {
  return new Router({
    mode: 'history',
    base: '/',
    linkActiveClass: 'nuxt-link-active',
    linkExactActiveClass: 'nuxt-link-exact-active',
    scrollBehavior,
    routes: [
		{
			path: "/logout",
			component: _233a66aa,
			name: "logout"
		},
		{
			path: "/kv",
			component: _554e188c,
			name: "kv"
		},
		{
			path: "/login",
			component: _78d116d8,
			name: "login"
		},
		{
			path: "/",
			component: _a1ad187e,
			name: "index"
		}
    ],
    
    
    fallback: false
  })
}
