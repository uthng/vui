import VueNotifications from "vue-notifications"
import gopherhcl from "gopher-hcl"
import _ from "lodash"

function Token(vault) {
  this.vault = vault
  this.apiUrl = vault.apiUrl
  this.axios = vault.axios
}

Token.prototype.revokeSelf = function(token) {
  this.vault.axios
    .$post(
      this.apiUrl + "/auth/token/revoke-self",
      {},
      {
        crossDomain: true,
        headers: {
          "X-Vault-Token": token
        }
      }
    )
    .catch(error => {
      // Catch error here and display it instead of in vault-secrets
      VueNotifications.error({
        title: error,
        message: error.response.statusText + ". " + error.response.data.errors
      })
    })
}

Token.prototype.renewSelf = function(token) {
  return this.vault.axios
    .$post(
      this.apiUrl + "/auth/token/renew-self",
      {},
      { crossDomain: true, headers: { "X-Vault-Token": token } }
    )
    .catch(error => {
      // Catch error here and display it instead of in vault-secrets
      VueNotifications.error({
        title: error,
        message: error.response.statusText + ". " + error.response.data.errors
      })
    })
}

Token.prototype.lookupSelf = function(token) {
  return this.vault.axios
    .$get(this.apiUrl + "/auth/token/lookup-self", {
      crossDomain: true,
      headers: {
        "X-Vault-Token": token
      }
    })
    .catch(error => {
      console.log(error)
      console.log(token)
      // Catch error here and display it instead of in vault-secrets
      VueNotifications.error({
        title: error,
        message: error.response.statusText + ". " + error.response.data.errors
      })
    })
}

Token.prototype.getTokenInfos = function(token) {
  return this.vault.axios
    .$get(this.apiUrl + "/auth/token/lookup-self", {
      crossDomain: true,
      headers: {
        "X-Vault-Token": token
      }
    })
    .then(res => {
      var tokenInfos = {
        username: "",
        display_name: "",
        expire: "",
        path: "",
        groups: [],
        policies: []
      }
      var i
      var promises = []

      tokenInfos.display_name = _.isNil(res.data.display_name)
        ? "N/A"
        : res.data.display_name
      tokenInfos.username = _.isNil(res.data.meta)
        ? "N/A"
        : res.data.meta.username
      tokenInfos.expire = _.isNil(res.data.expire_time)
        ? "N/A"
        : res.data.expire_time
      tokenInfos.path = res.data.path

      var policies = res.data.policies
      for (i = 0; i < policies.length; i++) {
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
          tokenInfos.policies[i] = {
            name: policies[i],
            rules: gopherhcl.parse(responses[i].rules)
          }
        }

        return tokenInfos
      })
    })
}

export default Token
