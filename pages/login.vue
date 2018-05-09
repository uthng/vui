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
                v-model="ldap.username"
                name="ldap-username"
                label="Login:"
                required
              />
              <v-text-field
                v-model="ldap.password"
                :append-icon="ldap.visible ? 'visibility' : 'visibility_off'"
                :append-icon-cb="() => (ldap.visible = !ldap.visible)"
                :type="ldap.visible ? 'password' : 'text'"
                name="ldap-password"
                label="Password:"
                required
                min="8"
              />
              <v-expansion-panel>
                <v-expansion-panel-content>
                  <div slot="header" class="blue--text">More options</div>
                  <v-card>
                    <v-card-text>
                      <v-text-field
                        v-model="ldap.path"
                        :rules="[(value) => (value.match(/^[a-zA-Z0-9][a-zA-Z0-9_-]+[a-zA-Z0-9]$/) !== null) || 'Path must contain only: [a-zA-Z0-9_-] and must not be started or ended by - or  _']"
                        name="ldap-path"
                        label="Path:"
                        required
                        min="8"
                      />
                    </v-card-text>
                  </v-card>
                </v-expansion-panel-content>
              </v-expansion-panel>
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
      ldap: {
        username: "",
        password: "",
        path: "ldap",
        visible: false
      },
      vaultToken: "",
      dlgLoading: false
    }
  },
  methods: {
    doLoginLdap: async function() {
      try {
        this.dlgLoading = true
        let ret = await this.$vault.ldap.login(
          this.ldap.path,
          this.ldap.username,
          this.ldap.password
        )

        this.$store.dispatch("setVtok", {
          token: ret.auth.client_token,
          ttl: ret.auth.lease_duration
        })
        this.$store.dispatch("setUser", {
          user: this.ldap.username,
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
        this.$store.dispatch("setVtok", {
          token: this.vaultToken,
          ttl: infos.data.creation_ttl
        })
        if (!_.isNil(infos.data)) {
          this.$store.dispatch("setUser", {
            user: _.isNil(infos.data.meta)
              ? infos.data.display_name
              : infos.data.meta.username,
            ttl: infos.data.creation_ttl
          })
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
