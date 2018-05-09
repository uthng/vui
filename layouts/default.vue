<template>
  <v-app dark>
    <v-navigation-drawer
      :mini-variant.sync="miniVariant"
      :clipped="clipped"
      v-model="drawer"
      fixed
      app
    >
      <v-list>
        <div v-for="item in items" v-if="item.visible" :key="item.title">
          <v-list-tile
            v-if="item.items.length <= 0"
            :href="item.href"
            nuxt
            exact
          >
            <v-list-tile-action>
              <v-icon v-html="item.action"/>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title v-text="item.title"/>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-group
            v-else
            v-model="item.active"
            :prepend-icon="item.action"
            no-action
          >
            <v-list-tile slot="activator" :href="item.href" nuxt>
              <v-list-tile-content>
                <v-list-tile-title>{{ item.title }}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile v-for="subItem in item.items" v-if="subItem.visible" :key="subItem.title" :href="subItem.href" nuxt>
              <v-list-tile-content>
                <v-list-tile-title>{{ subItem.title }}</v-list-tile-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-icon>{{ subItem.action }}</v-icon>
              </v-list-tile-action>
            </v-list-tile>
          </v-list-group>
        </div>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar :clipped-left="clipped" fixed app>
      <v-toolbar-side-icon @click="drawer = !drawer"/>
      <v-btn
        icon
        @click.stop="miniVariant = !miniVariant"
      >
        <v-icon v-html="miniVariant ? 'chevron_right' : 'chevron_left'"/>
      </v-btn>
      <v-btn
        icon
        @click.stop="clipped = !clipped"
      >
        <v-icon>web</v-icon>
      </v-btn>
      <v-btn
        icon
        @click.stop="fixed = !fixed"
      >
        <v-icon>remove</v-icon>
      </v-btn>
      <v-toolbar-title v-text="title"/>
      <v-spacer/>
    </v-toolbar>
    <v-content>
      <v-container>
        <nuxt />
      </v-container>
    </v-content>
    <v-footer :fixed="fixed" app>
      <span>&copy; 2018 - Thanh NGUYEN</span>
    </v-footer>
    <loader v-model="dlgLoading" :text="loadingText"/>
  </v-app>
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
      clipped: false,
      drawer: true,
      fixed: false,
      miniVariant: false,
      right: true,
      title: "Vault UI",
      dlgLoading: false,
      loadingText: "Loading..."
    }
  },
  computed: {
    items: function() {
      let items = [
        {
          action: "apps",
          title: "Account",
          active: false,
          visible: true,
          items: [
            {
              title: "Login",
              visible: this.$store.state.vtok === "",
              href: "/login"
            },
            { title: "Infos", visible: true, href: "/" },
            {
              title: "Logout",
              visible: this.$store.state.vtok !== "",
              href: "/logout"
            }
          ]
        },
        {
          action: "apps",
          title: "Secrets",
          active: false,
          visible: true,
          items: [
            { title: "Engines", visible: true, href: "/engine" },
            { title: "Key/Value", visible: true, href: "/kv" }
          ]
        },
        {
          action: "apps",
          title: "Auth",
          active: false,
          visible: true,
          items: [
            { title: "Methods", visible: true, href: "/auth" },
            { title: "LDAP", visible: true, href: "/ldap" }
          ]
        },
        {
          action: "apps",
          title: "Policies",
          active: true,
          visible: true,
          href: "/policy",
          items: []
        }
      ]
      return items
    }
  },
  mounted: function() {
    // Call check token at least one time when loading page
    this.checkToken()
  },
  methods: {
    renewToken: async function() {
      try {
        this.loadingText = "Renewing token..."
        this.dlgLoading = true

        let infos = await this.$vault.token.lookupSelf(this.$store.state.vtok)
        // Only renew token itself if it isnt token root
        //  or it has an expiration time
        if (
          infos.data.display_name !== "root" ||
          !_.isNil(infos.data.expire_time)
        ) {
          await this.$vault.token.renewSelf(this.$store.state.vtok)
        }

        this.$store.dispatch("setVtok", {
          token: this.$store.state.vtok,
          ttl: infos.data.creation_ttl
        })
        this.$store.dispatch("setUser", {
          user: this.$store.state.user,
          ttl: infos.data.creation_ttl
        })

        this.showMsg({
          message: "Your current Vault token has been renew successfully !"
        })
        this.dlgLoading = false
      } catch (error) {
        this.dlgLoading = false
        this.showMsg({ type: "error", message: error })
      }
    },
    // Set timeout for checking vtok expiration time every 1min.
    // While token expiration is stil valid, we call recursively this function
    // If the token will expire within 5 mins, a notification will be display
    // to user to renew. No need to clear timeout or anything after token expiration
    // instead of timer
    checkToken: function() {
      var self = this
      setTimeout(function() {
        if (self.$store.state.vtok !== "") {
          let now = new Date().getTime()
          let secs = (self.$store.state.vtok_expiration - now) / 1000
          if (secs > 0) {
            let mins = secs / 60
            if (mins <= 5) {
              self.showMsg({
                type: "warn",
                title: "",
                message:
                  "Your Vault token will expire within 5 mins !!! Click here to renew it !",
                opts: {
                  closeButton: false,
                  positionClass: "toast-top-full-width",
                  timeOut: "30000",
                  extendedTimeOut: "0",
                  preventDuplicates: true,
                  onclick: function() {
                    self.renewToken()
                  }
                }
              })
            }

            self.checkToken()
          }
        }
      }, 60000)
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
