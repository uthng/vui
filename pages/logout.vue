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
// import _ from 'lodash'

export default {
  data() {
    return {}
  },
  mounted: function() {
    try {
      this.$vault.token.revokeSelf(this.$store.state.vtok)
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
