import * as apiClient from './client'
import * as apiProject from './project'
import * as apiHome from './home'
import * as apiMonitor from './monitor'
const apiObj = {
  apiClient,
  apiProject,
  apiHome,
  apiMonitor
}
const install = function (Vue) {
  if (install.installed) return
  install.installed = true
  Object.defineProperties(Vue.prototype, {
    $fetch: {
      get() {
        return apiObj
      }
    }
  })
}
export default {
  install
}
