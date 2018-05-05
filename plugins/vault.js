import Vault from "~/lib/vault/vault"
import { VAULT_API_URL } from "~/config"

export default ({ app }, inject) => {
  // Create a new install Vault
  let vault = new Vault(VAULT_API_URL, app.$axios)
  // Inject it to context so we can access it by:
  // this.$vault, context.app.$vault
  inject("vault", vault)
}
