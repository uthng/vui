function Secret(vault) {
  this.vault = vault
  this.apiUrl = vault.apiUrl
  this.axios = vault.axios
}

Secret.prototype.getEngines = function(token) {
  return this.vault.axios
    .$get(this.apiUrl + "/sys/mounts", {
      crossDomain: true,
      headers: {
        "X-Vault-Token": token
      }
    })
    .then(response => {
      let engines = []
      let data = response.data

      for (var path in data) {
        engines.push(
          Object.assign(
            { path: path.substr(0, path.lastIndexOf("/")) },
            data[path]
          )
        )
      }

      return engines
    })
}

Secret.prototype.createEngine = function(engine, token) {
  let path = engine.path
  let secretEngine = Object.assign({}, engine)
  delete secretEngine.path

  return this.vault.axios.$post(
    this.apiUrl + "/sys/mounts/" + path,
    secretEngine,
    {
      crossDomain: true,
      headers: {
        "X-Vault-Token": token
      }
    }
  )
}

Secret.prototype.deleteEngine = function(path, token) {
  return this.vault.axios.$delete(this.apiUrl + "/sys/mounts/" + path, {
    crossDomain: true,
    headers: {
      "X-Vault-Token": token
    }
  })
}

Secret.prototype.updateEngine = function(engine, token) {
  let tune = {
    description: engine.description,
    default_lease_ttl: engine.config.default_lease_ttl,
    max_lease_ttl: engine.config.max_lease_ttl
  }

  return this.vault.axios.$post(
    this.apiUrl + "/sys/mounts/" + engine.path + "/tune",
    tune,
    {
      crossDomain: true,
      headers: {
        "X-Vault-Token": token
      }
    }
  )
}

export default Secret
