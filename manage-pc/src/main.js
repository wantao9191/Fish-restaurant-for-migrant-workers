import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import '/src/assets/js/wx-cloud.js'
import router from './router/index.js'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

const wxCloud = new cloud.Cloud({
    identityless: true,
    resourceAppid: 'wx6d21d95b8953e340',
    resourceEnv: 'cloud1-3gz5hyuc97e476c8',
    traceUser: true
})
console.log(wxCloud)
// // 51_lQ1yH2j4-n5GLn66FVGGdnQ2m8t4kgzae0wn_PoRqZe33UetLeEMTSpMXd68UE1qnNzkSPxpcIoCmMOeeUisslZyLujA3Kc1bOyRsT6a-RkOyqjygsK0rF2TqLqiHLS1XFBumPbUBMQqmUWgVZZaAHAAEE
wxCloud.init()
wxCloud.callFunction({
    name: 'forum',
    data: {
        action: 'getHotList'
    }
}).then(res=>{
    console.log(res)
})

app.use(ElementPlus)
app.use(router)
app.mount('#app')