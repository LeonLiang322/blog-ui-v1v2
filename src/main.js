import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { loadFonts } from './plugins/webfontloader'
import vuetify from "@/plugins/vuetify";
import { setGlobalOptions } from 'vue-request';
import './assets/scss/main.scss'
import 'viewerjs/dist/viewer.css'
import VueViewer from 'v-viewer'

setGlobalOptions({
  manual: true,
  loadingKeep: 1000
});

loadFonts().then();

createApp(App)
  .use(router)
  .use(store)
  .use(vuetify)
  .use(VueViewer)
  .mount('#app')

router.beforeEach((to, from, next) => {
  // window.document.title = '加载中ᓚᘏᗢ';
  to.meta.title && (document.title = to.meta.title);
  window.scrollTo(0, 0);
  next();
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
