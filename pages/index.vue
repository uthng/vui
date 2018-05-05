<template>
  <v-container fluid grid-list-xl>
    <v-layout row align-baseline justify-center align-center>
      <v-flex xs6 fill-height>
        <v-card>
          <v-card-title primary-title class="pink lighten-1">
            <div class="headline">Token</div>
          </v-card-title>
          <v-divider/>
          <v-list dense>
            <v-list-tile>
              <v-list-tile-content class="body-1">User:</v-list-tile-content>
              <v-list-tile-content class="align-end body-1">{{ tokenInfos.username }}</v-list-tile-content>
            </v-list-tile>
            <v-list-tile>
              <v-list-tile-content class="body-1">Path:</v-list-tile-content>
              <v-list-tile-content class="align-end body-1">{{ tokenInfos.path }}</v-list-tile-content>
            </v-list-tile>
            <v-list-tile>
              <v-list-tile-content class="body-1">Token:</v-list-tile-content>
              <v-list-tile-content class="align-end body-1">{{ this.$store.state.vtok }}</v-list-tile-content>
            </v-list-tile>
            <v-list-tile>
              <v-list-tile-content class="body-1">Expire:</v-list-tile-content>
              <v-list-tile-content class="align-end body-1">{{ tokenInfos.expire }}</v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-card>
      </v-flex>
      <v-flex xs6 fill-height>
        <v-card>
          <v-card-title primary-title class="pink lighten-1" >
            <div class="headline">Policies</div>
          </v-card-title>
          <v-divider/>
          <v-list dense>
            <v-list-tile v-for="policy in tokenInfos.policies" :key="policy.name">
              <v-list-tile-content class="body-1">{{ policy.name }}</v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout row align-baseline justify-center align-center>
      <v-flex xs12 fill-height>
        <v-card>
          <v-card-title primary-title class="pink lighten-1">
            <div class="headline">Permissions</div>
          </v-card-title>
          <v-divider/>
          <v-list two-line subheader>
            <div v-for="policy in tokenInfos.policies" :key="policy.name">
              <v-subheader class="title">{{ policy.name }}</v-subheader>
              <v-list-tile v-for="(value, key) in policy.rules.path" :key="key" avatar>
                <v-list-tile-content>
                  <v-list-tile-title>Path: {{ key }}</v-list-tile-title>
                  <v-list-tile-sub-title>Capabilities: {{ value.capabilities.join(', ') }}</v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-divider/>
            </div>
          </v-list>
        </v-card>
      </v-flex>
    </v-layout>

    <loader v-model="dlgLoading"/>
  </v-container>
</template>

<script>
// import _ from 'lodash'
import Loader from "~/components/loader/loader.vue"

export default {
  layout: "default",
  components: {
    Loader
  },
  data() {
    return {
      tokenInfos: {
        username: "",
        expire: "",
        path: "",
        groups: [],
        policies: []
      },
      dlgLoading: false
    }
  },
  mounted: async function() {
    try {
      this.dlgLoading = true
      let infos = await this.$vault.token.getTokenInfos(this.$store.state.vtok)
      this.tokenInfos = Object.assign({}, infos)
      this.dlgLoading = false
    } catch (error) {
      this.dlgLoading = false
      this.showMsg({ type: "error", message: error })
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
