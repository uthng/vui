import VueNotifications from "vue-notifications"

function Userpass(vault) {
  this.vault = vault
  this.apiUrl = vault.apiUrl
  this.axios = vault.axios
}

Userpass.prototype.login = function(userpass, user, pass) {
  return this.vault.axios
    .$post(
      this.apiUrl + "/auth/" + userpass + "/login/" + user,
      { password: pass },
      { crossDomain: true }
    )
    .catch(error => {
      VueNotifications.error({
        title: error,
        message: error.response.statusText + ". " + error.response.data.errors
      })
    })
}

Userpass.prototype.getUsers = function(userpass, token) {
  return this.vault.axios
    .$get(this.apiUrl + "/auth/" + userpass + "/users?list=true", {
      crossDomain: true,
      headers: {
        "X-Vault-Token": token
      }
    })
    .then(response => {
      let users = []
      let promises = []
      let data = response.data.keys

      for (var i = 0; i < data.length; i++) {
        promises.push(
          this.vault.axios.$get(
            this.apiUrl + "/auth/" + userpass + "/users/" + data[i],
            {
              crossDomain: true,
              headers: {
                "X-Vault-Token": token
              }
            }
          )
        )
      }

      return Promise.all(promises).then(function(responses) {
        for (i = 0; i < responses.length; i++) {
          var obj = Object.assign({ username: data[i] }, responses[i].data)
          users[i] = obj
        }

        return users
      })
    })
    .catch(error => {
      VueNotifications.error({
        title: error,
        message: error.response.statusText + ". " + error.response.data.errors
      })

      return []
    })
}

Userpass.prototype.deleteUser = function(userpass, name, token) {
  return this.vault.axios.$delete(
    this.apiUrl + "/auth/" + userpass + "/users/" + name,
    {
      crossDomain: true,
      headers: {
        "X-Vault-Token": token
      }
    }
  )
}

Userpass.prototype.updateUser = function(userpass, user, token) {
  if (user.password === "") {
    delete user.password
  }

  user.policies = user.policies.toString()

  return this.vault.axios.$post(
    this.apiUrl + "/auth/" + userpass + "/users/" + user.username,
    user,
    {
      crossDomain: true,
      headers: {
        "X-Vault-Token": token
      }
    }
  )
}

export default Userpass
