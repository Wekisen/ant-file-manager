import 'ant-design-vue/dist/antd.css'
import { Modal, Empty, Pagination, Spin, Popconfirm, Button, Icon, Row, Col, message } from 'ant-design-vue/lib'
import Dragger from 'ant-design-vue/lib/upload/Dragger'
import axios from 'axios'

import Vue from 'vue'
import App from './App.vue'

Vue.prototype.$axios = axios
Vue.prototype.$message = message

Vue.use(Empty)
Vue.use(Pagination)
Vue.use(Modal)
Vue.use(Spin)
Vue.use(Popconfirm)
Vue.use(Button)
Vue.use(Icon)
Vue.use(Row)
Vue.use(Col)
Vue.component('a-upload-dragger', Dragger)

new Vue({
  el: '#app',
  render: h => h(App)
})
