import VueNotifications from "vue-notifications"

function KV(vault) {
  this.vault = vault
  this.apiUrl = vault.apiUrl
  this.axios = vault.axios
}

KV.prototype.getSecretKeys = function(path, token) {
  return this.vault.axios
    .$get(this.apiUrl + "/" + path + "?list=true", {
      crossDomain: true,
      headers: { "X-Vault-Token": token }
    })
    .then(response => {
      return response.data.keys
    })
}

KV.prototype.getSecretKeyValue = function(path, token) {
  return this.vault.axios
    .$get(this.apiUrl + "/" + path, {
      crossdomain: true,
      headers: { "X-Vault-Token": token }
    })
    .then(response => {
      return response.data
    })
}

KV.prototype.createSecretKeyValue = function(path, value, token) {
  this.vault.axios.$post(this.apiUrl + "/" + path, value, {
    crossdomain: true,
    headers: { "X-Vault-Token": token }
  })
}

KV.prototype.deleteSecretKeyValue = function(path, token) {
  this.vault.axios.$delete(this.apiUrl + "/" + path, {
    crossdomain: true,
    headers: { "X-Vault-Token": token }
  })
}

KV.prototype.getSecretRecurseKeys = function(path, token) {
  var arrKeyValue = []
  var self = this
  var arrPaths = []
  var index = 0

  arrPaths.push(path)

  function loopSecretKeys() {
    let path = arrPaths[index]

    if (path.endsWith("/")) {
      arrKeyValue.push({ key: path, value: null })
      return self.axios
        .$get(self.apiUrl + "/" + path + "?list=true", {
          crossDomain: true,
          headers: { "X-Vault-Token": token }
        })
        .then(response => {
          let keys = response.data.keys
          for (var i = 0; i < keys.length; i++) {
            arrPaths.push(path + keys[i])
          }

          // Check if we reach the end of path array
          // if not call recursively function again
          if (index < arrPaths.length - 1) {
            index = index + 1
            return loopSecretKeys()
          }

          // When we reach the end of path array
          // Just return arrKeyValue filled
          return arrKeyValue
        })
        .catch(error => {
          // Catch error here and display it instead of in vault-secrets
          VueNotifications.error({
            title: error,
            message:
              error.response.statusText + ". " + error.response.data.errors
          })

          // When an error occurs, display error message and
          // continue to the next path in the array
          // if we dont reach the end. Otherwise, return fullfilled key/value array
          if (index < arrPaths.length - 1) {
            index = index + 1
            return loopSecretKeys()
          }

          return arrKeyValue

          // Notes: we cannot use finally to avoid duplicating
          // code because finally return a final promise and stops there
          // So in the vault-secrets.js, we will get undefined as result
        })
    } else {
      return self.axios
        .$get(self.apiUrl + "/" + path, {
          crossdomain: true,
          headers: { "X-Vault-Token": token }
        })
        .then(response => {
          arrKeyValue.push({ key: path, value: response.data })

          // Check if we reach the end of path array
          // if not call recursively function again
          if (index < arrPaths.length - 1) {
            index = index + 1
            return loopSecretKeys()
          }

          return arrKeyValue
        })
        .catch(error => {
          // Catch error here and display it instead of in vault-secrets
          VueNotifications.error({
            title: error,
            message:
              error.response.statusText + ". " + error.response.data.errors
          })

          // When an error occurs, display error message and
          // continue to the next path in the array
          // if we dont reach the end. Otherwise, return fullfilled key/value array
          if (index < arrPaths.length - 1) {
            index = index + 1
            return loopSecretKeys()
          }

          return arrKeyValue

          // Notes: we cannot use finally to avoid duplicating
          // code because finally return a final promise and stops there
          // So in the vault-secrets.js, we will get undefined as result
        })
    }
  }

  return loopSecretKeys()
}

export default KV
