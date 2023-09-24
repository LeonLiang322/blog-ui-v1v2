import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { loadFonts } from './plugins/webfontloader'
import vuetify from "@/plugins/vuetify";
import { setGlobalOptions } from 'vue-request';
import './assets/scss/main.scss'
import 'viewerjs/dist/viewer.css'
import viewer from 'v-viewer'
import VueParticles from "vue-particles";
import jwtDecode from "jwt-decode";

setGlobalOptions({
  manual: true,
  loadingKeep: 1000
});

loadFonts().then();

createApp(App)
  .use(router)
  .use(store)
  .use(vuetify)
  .use(VueParticles)
  .use(viewer)
  .mount('#app')

router.beforeEach((to, from, next) => {
  to.meta.title && (document.title = to.meta.title);
  window.scrollTo(0, 0);
  if (from.path.startsWith('/admin')) {
    next();
    return;
  }
  if (to.path.startsWith('/admin')) {

    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      if (!decoded.admin) {
        store.dispatch('snackbar/openSnackbar', {
          msg: '无访问权限',
          type: 'warning'
        }).then(() => {
          next(from.path);
        });
      } else {
        store.dispatch('snackbar/openSnackbar', {
          msg: '管理员验证成功',
          type: 'success'
        }).then(() => {
          if (!from.path.startsWith('admin')) sessionStorage.setItem('router_from', from.path);
          next();
        });
      }
    } else {
      store.dispatch('snackbar/openSnackbar', {
        msg: '未登录用户',
        type: 'warning'
      }).then(() => {
        next(from.path);
      });
    }
  } else {
    next()
  }

})

const debounce = (fn, delay) => {
  let timer = null;
  return function () {
    let context = this;
    let args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };
};

const _ResizeObserver = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
  constructor(callback) {
    callback = debounce(callback, 50);
    super(callback);
  }
};
