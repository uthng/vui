import VueNotifications from "vue-notifications"

function Consul(vault) {
  this.vault = vault
  this.apiUrl = vault.apiUrl
  this.axios = vault.axios
}

Consul.prototype.getConfig = function(consul, token) {
  return this.vault.axios
    .$get(this.apiUrl + "/" + consul + "/config/access", {
      crossDomain: true,
      headers: {
        "X-Vault-Token": token
      }
    })
    .then(response => {
      return response.data
    })
}

Consul.prototype.updateConfig = function(consul, config, token) {
  return this.vault.axios.$post(
    this.apiUrl + "/" + consul + "/config/access",
    config,
    {
      crossDomain: true,
      headers: {
        "X-Vault-Token": token
      }
    }
  )
}

Consul.prototype.getRoles = function(consul, token) {
  return this.vault.axios
    .$get(this.apiUrl + "/" + consul + "/roles?list=true", {
      crossDomain: true,
      headers: {
        "X-Vault-Token": token
      }
    })
    .then(response => {
      let roles = []
      let promises = []
      let names = response.data.keys

      for (var i = 0; i < names.length; i++) {
        promises.push(
          this.vault.axios.$get(
            this.apiUrl + "/" + consul + "/roles/" + names[i],
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
        for (var i = 0; i < responses.length; i++) {
          var obj = Object.assign({ name: names[i] }, responses[i].data)
          roles[i] = obj

          let buff = Buffer.from(roles[i].policy, "base64")
          roles[i].policy = buff.toString("ascii")
        }

        return roles
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

Consul.prototype.updateRole = function(consul, role, token) {
  let buff = Buffer.from(role.policy, "ascii")
  role.policy = buff.toString("base64")

  return this.vault.axios.$post(
    this.apiUrl + "/" + consul + "/roles/" + role.name,
    role,
    {
      crossDomain: true,
      headers: {
        "X-Vault-Token": token
      }
    }
  )
}

Consul.prototype.deleteRole = function(consul, role, token) {
  return this.vault.axios.$delete(
    this.apiUrl + "/" + consul + "/roles/" + role,
    {
      crossDomain: true,
      headers: {
        "X-Vault-Token": token
      }
    }
  )
}

Consul.prototype.generateToken = function(consul, role, token) {
  return this.vault.axios.$get(this.apiUrl + "/" + consul + "/creds/" + role, {
    crossDomain: true,
    headers: {
      "X-Vault-Token": token
    }
  })
}

export default Consul
