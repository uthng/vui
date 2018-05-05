import Vue from "vue"
import VueNotifications from "vue-notifications"

import "jquery"
import toastr from "toastr" // https://github.com/CodeSeven/toastr
import "toastr/build/toastr.min.css"

function toast({ title, message, type, opts }) {
  if (type === VueNotifications.types.warn) type = "warning"
  return toastr[type](message, title, opts)
}

const options = {
  success: toast,
  error: toast,
  info: toast,
  warn: toast
}

Vue.use(VueNotifications, options)
