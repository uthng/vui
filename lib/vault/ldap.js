function Ldap(vault) {
  this.vault = vault
  this.apiUrl = vault.apiUrl
  this.axios = vault.axios
}

Ldap.prototype.login = function(user, pass) {
  return this.vault.axios
    .$post(
      this.apiUrl + "/auth/ldap/login/" + user,
      { password: pass },
      { crossDomain: true }
    )
    .catch(err => {
      console.log(err)
    })
}

export default Ldap
