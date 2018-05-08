function Auth(vault) {
  this.vault = vault
  this.apiUrl = vault.apiUrl
  this.axios = vault.axios
}

Auth.prototype.getMethods = function(token) {
  return this.vault.axios
    .$get(this.apiUrl + "/sys/auth", {
      crossDomain: true,
      headers: {
        "X-Vault-Token": token
      }
    })
    .then(response => {
      let methods = []
      let data = response.data

      for (var path in data) {
        methods.push(
          Object.assign(
            { path: path.substr(0, path.lastIndexOf("/")) },
            data[path]
          )
        )
      }

      return methods
    })
}

Auth.prototype.createMethod = function(method, token) {
  let path = method.path
  let authMethod = Object.assign({}, method)
  delete authMethod.path

  return this.vault.axios.$post(this.apiUrl + "/sys/auth/" + path, authMethod, {
    crossDomain: true,
    headers: {
      "X-Vault-Token": token
    }
  })
}

Auth.prototype.deleteMethod = function(path, token) {
  return this.vault.axios.$delete(this.apiUrl + "/sys/auth/" + path, {
    crossDomain: true,
    headers: {
      "X-Vault-Token": token
    }
  })
}

Auth.prototype.updateMethod = function(method, token) {
  let tune = {
    description: method.description,
    default_lease_ttl: method.config.default_lease_ttl,
    max_lease_ttl: method.config.max_lease_ttl
  }

  return this.vault.axios.$post(
    this.apiUrl + "/sys/auth/" + method.path + "/tune",
    tune,
    {
      crossDomain: true,
      headers: {
        "X-Vault-Token": token
      }
    }
  )
}

export default Auth
