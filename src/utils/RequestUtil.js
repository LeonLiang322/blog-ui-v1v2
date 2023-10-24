import axios from "axios";
import store from "@/store";
import router from "@/router";
import jwtDecode from "jwt-decode";

const sysInstance = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
});

// 请求拦截器
sysInstance.interceptors.request.use(
  (config) => {
    // 在发送请求之前可以做一些处理，如添加公共请求头、处理请求参数等
    config.headers.Authorization = localStorage.getItem('token');
    // console.log('发送请求:', config);
    return config;
  },
  (error) => {
    router.push('/error').then(() => {
      store.dispatch('snackbar/openSnackbar', {
        msg: error,
        type: 'error',
      }).then();
    });

    return Promise.reject(error);
  }
);

// 响应拦截器
sysInstance.interceptors.response.use(
  (response) => {
    // 在收到响应后可以做一些处理，如统一处理错误状态码、处理响应数据等
    if (response.data.code === "500") {
      router.push({path: '/error', query: { msg: response.data.msg }}).then();
      return response;
    }
    if (response.data.code === "404") {
      store.dispatch('snackbar/openSnackbar', {
        msg: response.data.msg,
        type: 'warning',
      }).then();
      return response;
    }
    return response;
  },
  (error) => {
    router.push({path: '/error', query: { msg: error }}).then();
    return Promise.reject(error);
  }
);

const sysMethods = ['get', 'post', 'put', 'delete', 'patch'];

const sys = {}

sysMethods.forEach((method) => {
  sys[method] = (url, paramsOrData) => {
    const config = { url, method }

    if (method === 'get' || method === 'delete') {
      config.params = paramsOrData;
    } else {
      config.data = paramsOrData;
    }

    return sysInstance(config);
  }
});



// ***************** 图床 ***************** //
const picInstance = axios.create({
  baseURL: 'https://img.stayuplate.icu/api/v1',
});

// 请求拦截器
picInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = jwtDecode(token)?.picToken;
    }
    return config;
  },
  (error) => {
    store.dispatch('snackbar/openSnackbar', {
      msg: error,
      type: 'error',
    }).then();
    return Promise.reject(error);
  }
);

// 响应拦截器
picInstance.interceptors.response.use(
  (response) => {
    if (!response.data.status) {
      store.dispatch('snackbar/openSnackbar', {
        msg: response.data.message,
        type: 'error',
      }).then(response.data.data = null);
    }
    return response;
  },
  (error) => {
    store.dispatch('snackbar/openSnackbar', {
      msg: error,
      type: 'error',
    }).then();
    return Promise.reject(error);
  }
);

const picMethods = ['post', 'delete'];

const pic = {}

picMethods.forEach((method) => {
  pic[method] = (url, data) => picInstance({ url, method, data });
});

export default { sys, pic }