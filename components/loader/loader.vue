<template>
  <v-layout row justify-center align-center>
    <v-dialog :value="value" persistent fullscreen content-class="dialog-loading" @input="$emit('input', $event.target.value)">
      <v-container fill-height>
        <v-layout column justify-center align-center>
          <v-progress-circular :size="150" :width="10" indeterminate color="pink"/>
          <div class="my-5 title">{{ text }}</div>
        </v-layout>
      </v-container>
    </v-dialog>
  </v-layout>
</template>

<script>
//import _ from "lodash"

export default {
  name: "Loader",
  props: {
    value: {
      type: Boolean,
      default: false
    },
    text: {
      default: "Loading...",
      type: String
    }
  },
  data() {
    return {}
  },
  computed: {},
  methods: {}
}
</script>

<style>
.dialog-loading {
  background-color: #303030;
  opacity: 0.7;
}
</style>
