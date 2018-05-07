import gopherhcl from "gopher-hcl"

function Policy(vault) {
  this.vault = vault
  this.apiUrl = vault.apiUrl
  this.axios = vault.axios
}

Policy.prototype.getPolicyRules = function(policy, token) {
  return this.vault.axios
    .$get(this.apiUrl + "/sys/policy/" + policy, {
      crossDomain: true,
      headers: {
        "X-Vault-Token": token
      }
    })
    .then(response => {
      return gopherhcl.parse(response.rules)
    })
}

Policy.prototype.updatePolicy = function(policy, token) {
  return this.vault.axios.$put(
    this.apiUrl + "/sys/policy/" + policy.name,
    { policy: policy.rules },
    {
      crossDomain: true,
      headers: {
        "X-Vault-Token": token
      }
    }
  )
}

Policy.prototype.deletePolicy = function(name, token) {
  return this.vault.axios.$delete(this.apiUrl + "/sys/policy/" + name, {
    crossDomain: true,
    headers: {
      "X-Vault-Token": token
    }
  })
}

Policy.prototype.getPolicies = function(token) {
  return this.vault.axios
    .$get(this.apiUrl + "/sys/policy", {
      crossDomain: true,
      headers: {
        "X-Vault-Token": token
      }
    })
    .then(response => {
      let promises = []
      let res = []

      let policies = response.data.policies
      for (var i = 0; i < policies.length; i++) {
        promises.push(
          this.vault.axios.$get(this.apiUrl + "/sys/policy/" + policies[i], {
            crossDomain: true,
            headers: {
              "X-Vault-Token": token
            }
          })
        )
      }

      return Promise.all(promises).then(function(responses) {
        for (i = 0; i < responses.length; i++) {
          res[i] = {
            name: policies[i],
            rules: responses[i].data.rules
          }
        }

        return res
      })
    })
}

export default Policy
