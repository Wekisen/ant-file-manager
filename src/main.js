import 'ant-design-vue/dist/antd.css'
import { Modal, Empty, Pagination, Spin, Popconfirm, Button, Icon, Row, Col, message } from 'ant-design-vue/lib'
import Dragger from 'ant-design-vue/lib/upload/Dragger'
import axios from 'axios'

import Vue from 'vue'
import App from './App.vue'

Vue.prototype.$axios = axios
Vue.prototype.$message = message

Vue.component('a-empty', Empty)
Vue.component('a-pagination', Pagination)
Vue.component('a-modal', Modal)
Vue.component('a-spin', Spin)
Vue.component('a-upload-dragger', Dragger)
Vue.component('a-popconfirm', Popconfirm)
Vue.component('a-button', Button)
Vue.component('a-icon', Icon)
Vue.component('a-row', Row)
Vue.component('a-col', Col)

new Vue({
  el: '#app',
  render: h => h(App)
})
