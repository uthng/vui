import Token from "./token.js"
import Ldap from "./ldap.js"
import Policy from "./policy.js"
import KV from "./kv.js"
import Auth from "./auth.js"
import Secret from "./secret.js"
import Consul from "./consul.js"
import Userpass from "./userpass.js"

function Vault(apiUrl, axios) {
  this.apiUrl = apiUrl
  this.axios = axios

  this.kv = new KV(this)
  this.token = new Token(this)
  this.ldap = new Ldap(this)
  this.policy = new Policy(this)
  this.auth = new Auth(this)
  this.secret = new Secret(this)
  this.consul = new Consul(this)
  this.userpass = new Userpass(this)
}

export default Vault
