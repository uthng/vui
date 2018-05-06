<template>
  <v-layout row justify-center align-center>
    <v-flex xs12>
      <v-tabs
        slot="extension"
        color="blue darken-3"
      >
        <v-tabs-slider color="grey lighten-1"/>
        <v-tab>LDAP</v-tab>
        <v-tab>TOKEN</v-tab>
        <v-tab-item>
          <v-card flat>
            <v-card-text>
              <v-text-field
                v-model="userLogin"
                name="user-login"
                label="Login:"
                required
              />
              <v-text-field
                v-model="userPass"
                :append-icon="userVisiblePass ? 'visibility' : 'visibility_off'"
                :append-icon-cb="() => (userVisiblePass = !userVisiblePass)"
                :type="userVisiblePass ? 'password' : 'text'"
                name="user-password"
                label="Password:"
                required
                min="8"
              />
              <v-card-actions>
                <v-btn flat color="blue">Cancel</v-btn>
                <v-btn flat color="blue" @click.stop="doLoginLdap()">Login</v-btn>
              </v-card-actions>
            </v-card-text>
          </v-card>
        </v-tab-item>
        <v-tab-item >
          <v-card>
            <v-card-text>
              <v-text-field
                v-model="vaultToken"
                name="vault-token"
                label="Vault Token:"
                required
              />
            </v-card-text>
            <v-card-actions>
              <v-btn flat color="blue">Cancel</v-btn>
              <v-btn flat color="blue" @click.stop="doLoginToken()">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-tab-item>
      </v-tabs>
    </v-flex>
    <loader v-model="dlgLoading"/>
  </v-layout>
</template>

<script>
import _ from "lodash"
import Loader from "~/components/loader/loader.vue"

export default {
  components: {
    Loader
  },
  data() {
    return {
      userLogin: "",
      userPass: "",
      vaultToken: "",
      userVisiblePass: false,
      dlgLoading: false
    }
  },
  methods: {
    doLoginLdap: async function() {
      try {
        this.dlgLoading = true
        let ret = await this.$vault.ldap.login(this.userLogin, this.userPass)

        this.$store.dispatch("setVtok", {
          token: ret.auth.client_token,
          ttl: ret.auth.lease_duration
        })
        this.$store.dispatch("setUser", {
          user: this.userLogin,
          ttl: ret.auth.lease_duration
        })

        this.showMsg({ message: "You are successfully logged in !" })
        this.$router.push("/")
        this.dlogLoading = false
      } catch (error) {
        this.showMsg({ type: "error", message: error })
        this.dlgLoading = false
      }
    },
    doLoginToken: async function() {
      try {
        this.dlgLoading = true
        // Call get token to verify if it is token root or special ones
        let infos = await this.$vault.token.lookupSelf(this.vaultToken)
        this.$store.dispatch("setVtok", this.vaultToken)
        if (!_.isNil(infos.data)) {
          this.$store.dispatch(
            "setUser",
            _.isNil(infos.data.meta)
              ? infos.data.display_name
              : infos.data.meta.username
          )
        }

        this.showMsg({ message: "Your token has been saved correctly !" })
        this.$router.push("/")
        this.dlogLoading = false
      } catch (error) {
        this.showMsg({ type: "error", message: error })
        this.dlgLoading = false
      }
    }
  },
  notifications: {
    showMsg: {
      type: "success",
      title: "",
      message: ""
    }
  }
}
</script>
<style>
.dialog-loading {
  background-color: #303030;
  opacity: 0.7;
}
</style>
