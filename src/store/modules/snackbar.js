/**
 * @param msg 信息
 * @param type snackbar类型
 * @param visible 是否可见
 * @param showClose 关闭按钮
 * @param timeout 停留持续时间
 */
const snackbar = {
  namespaced: true,
  state: {
    msg: '',
    type: '',
    visible: false,
    showClose: true,
    timeout: 5000,
  },
  // 逻辑处理,同步函数
  mutations: {
    OPEN_SNACKBAR(state, options) {
      state.visible = true
      state.msg = options.msg
      state.type = options.type
    },
    CLOSE_SNACKBAR(state) {
      state.visible = false
    },

  },
  // 逻辑处理,异步函数
  actions :{
    openSnackbar (context, options){
      let timeout = context.state.timeout
      context.commit('OPEN_SNACKBAR', {
        msg: options.msg,
        type: options.type,
        // showClose: options.showClose
      })
      setTimeout(()=>{
        context.commit('CLOSE_SNACKBAR')
      }, timeout)
    }
  }
}
export default snackbar;