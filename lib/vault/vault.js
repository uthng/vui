import Token from "./token.js"
import Ldap from "./ldap.js"
import Policy from "./policy.js"
import KV from "./kv.js"
import Auth from "./auth.js"

function Vault(apiUrl, axios) {
  this.apiUrl = apiUrl
  this.axios = axios

  this.kv = new KV(this)
  this.token = new Token(this)
  this.ldap = new Ldap(this)
  this.policy = new Policy(this)
  this.auth = new Auth(this)
}

export default Vault
