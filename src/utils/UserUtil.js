import req from "@/utils/RequestUtil";
import {useRequest} from "vue-request";
import store from "@/store";

export const keepAlive = async (reload) => {
  const keepAliveService = async v => {
    const result = await req.sys.post('/users/keep', v);
    return result.data;
  }

  // 用户保活
  const {
    data: token,
    runAsync: keepRun
  } = useRequest(keepAliveService, {
    defaultParams: [{}],
  });

  const localToken = localStorage.getItem('token');
  if (localToken) {
    await keepRun(localToken);
    if (token.value.data !== null) {
      localStorage.setItem('token', token.value.data);
    } else {
      localStorage.removeItem('token');
      reload();
      await store.dispatch('snackbar/openSnackbar', {
        msg: token.value.msg,
        color: 'warning',
      });
    }
  }
}