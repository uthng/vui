<template>
  <v-layout row justify-center align-center>
    <v-flex xs12>
      <div class="text-xs-center">
        <img src="/bye.png">
      </div>
    </v-flex>
    <v-flex xs12>
      <div class="text-xs-center">
        <img src="/bye.png">
      </div>
    </v-flex>
    <v-flex xs12>
      <div class="text-xs-center">
        <img src="/bye.png">
      </div>
    </v-flex>
  </v-layout>
</template>

<script>
import _ from "lodash"

export default {
  data() {
    return {}
  },
  mounted: async function() {
    try {
      let infos = await this.$vault.token.lookupSelf(this.$store.state.vtok)
      // Only revoke token it self if it isnt token root
      //  or it has an expiration time
      if (
        infos.data.display_name !== "root" ||
        !_.isNil(infos.data.expire_time)
      ) {
        this.$vault.token.revokeSelf(this.$store.state.vtok)
      }
      this.$store.dispatch("logout")
      this.showMsg({ message: "You are logged out now ! See you soon !" })
    } catch (err) {
      this.showMsg({ type: "error", message: err })
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
</style>
