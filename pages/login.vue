<template>
  <v-layout row justify-center align-center>
    <v-flex xs12>
      <v-tabs
        slot="extension"
        color="pink darken-1"
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
                <v-btn flat color="pink">Cancel</v-btn>
                <v-btn flat color="pink" @click.stop="doLogin()">Login</v-btn>
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
              <v-btn flat color="pink">Cancel</v-btn>
              <v-btn flat color="pink">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-tab-item>
      </v-tabs>
    </v-flex>
    <loader v-model="dlgLoading"/>
  </v-layout>
</template>

<script>
// import _ from 'lodash'
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
    doLogin: async function() {
      try {
        this.dlgLoading = true
        let ret = await this.$vault.ldap.login(this.userLogin, this.userPass)
        this.$store.dispatch("setVtok", ret.auth.client_token)
        this.$store.dispatch("setUser", this.userLogin)

        this.showMsg({ message: "You are successfully logged in !" })
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
