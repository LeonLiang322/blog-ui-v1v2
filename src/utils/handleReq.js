import axios from "axios";
import store from "@/store";
import router from "@/router";

const sysInstance = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
});

// 请求拦截器
sysInstance.interceptors.request.use(
  (config) => {
    // 在发送请求之前可以做一些处理，如添加公共请求头、处理请求参数等
    config.headers.Authorization = '123';
    // console.log('发送请求:', config);
    return config;
  },
  (error) => {
    router.push('/error').then(r => {
      store.dispatch('snackbar/openSnackbar', {
        msg: error,
        color: 'error',
      }).then();
    });

    return Promise.reject(error);
  }
);

// 响应拦截器
sysInstance.interceptors.response.use(
  (response) => {
    // 在收到响应后可以做一些处理，如统一处理错误状态码、处理响应数据等
    // console.log('收到响应:', response);
    return response;
  },
  (error) => {
    router.push('/error').then(r => {
      store.dispatch('snackbar/openSnackbar', {
        msg: error,
        color: 'error',
      }).then();
    });
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

const picInstance = axios.create({
  baseURL: 'https://img.stayuplate.icu/api/v1',
});

// 请求拦截器
picInstance.interceptors.request.use(
  (config) => {
    config.headers.Authorization = 'Bearer 2|Ja2NyZ3EVv7jR7LyHhY33RwYAUwwJUxS83UpJi3R';
    return config;
  },
  (error) => {
    store.dispatch('snackbar/openSnackbar', {
      msg: error,
      color: 'error',
    }).then();
    return Promise.reject(error);
  }
);

// 响应拦截器
picInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    store.dispatch('snackbar/openSnackbar', {
      msg: error,
      color: 'error',
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