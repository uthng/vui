import VueNotifications from "vue-notifications"

function Ldap(vault) {
  this.vault = vault
  this.apiUrl = vault.apiUrl
  this.axios = vault.axios
}

Ldap.prototype.login = function(ldap, user, pass) {
  return this.vault.axios
    .$post(
      this.apiUrl + "/auth/" + ldap + "/login/" + user,
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

Ldap.prototype.getGroups = function(ldap, token) {
  return this.vault.axios
    .$get(this.apiUrl + "/auth/" + ldap + "/groups?list=true", {
      crossDomain: true,
      headers: {
        "X-Vault-Token": token
      }
    })
    .then(response => {
      let groups = []
      let promises = []
      let data = response.data.keys

      for (var i = 0; i < data.length; i++) {
        promises.push(
          this.vault.axios.$get(
            this.apiUrl + "/auth/" + ldap + "/groups/" + data[i],
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
          groups[i] = {
            name: data[i],
            policies: responses[i].data.policies
          }
        }

        return groups
      })
    })
}

Ldap.prototype.deleteGroup = function(ldap, name, token) {
  return this.vault.axios.$delete(
    this.apiUrl + "/auth/" + ldap + "/groups/" + name,
    {
      crossDomain: true,
      headers: {
        "X-Vault-Token": token
      }
    }
  )
}

Ldap.prototype.updateGroup = function(ldap, group, token) {
  let grp = {
    policies: group.policies.toString()
  }

  return this.vault.axios.$post(
    this.apiUrl + "/auth/" + ldap + "/groups/" + group.name,
    grp,
    {
      crossDomain: true,
      headers: {
        "X-Vault-Token": token
      }
    }
  )
}

Ldap.prototype.getUsers = function(ldap, token) {
  return this.vault.axios
    .$get(this.apiUrl + "/auth/" + ldap + "/users?list=true", {
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
            this.apiUrl + "/auth/" + ldap + "/users/" + data[i],
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
          users[i] = {
            username: data[i],
            groups: responses[i].data.groups.split(/\s*,\s*/),
            policies: responses[i].data.policies
          }
        }

        return users
      })
    })
}

Ldap.prototype.deleteUser = function(ldap, name, token) {
  return this.vault.axios.$delete(
    this.apiUrl + "/auth/" + ldap + "/users/" + name,
    {
      crossDomain: true,
      headers: {
        "X-Vault-Token": token
      }
    }
  )
}

Ldap.prototype.updateUser = function(ldap, user, token) {
  let newUser = {
    policies: user.policies.toString(),
    groups: user.groups.toString()
  }

  return this.vault.axios.$post(
    this.apiUrl + "/auth/" + ldap + "/users/" + user.username,
    newUser,
    {
      crossDomain: true,
      headers: {
        "X-Vault-Token": token
      }
    }
  )
}

Ldap.prototype.updateConfig = function(ldap, config, token) {
  return this.vault.axios.$post(
    this.apiUrl + "/auth/" + ldap + "/config",
    config,
    {
      crossDomain: true,
      headers: {
        "X-Vault-Token": token
      }
    }
  )
}

Ldap.prototype.getConfig = function(ldap, token) {
  return this.vault.axios
    .$get(this.apiUrl + "/auth/" + ldap + "/config", {
      crossDomain: true,
      headers: {
        "X-Vault-Token": token
      }
    })
    .then(response => {
      return response.data
    })
}

export default Ldap
