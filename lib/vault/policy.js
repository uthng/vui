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

export default Policy
