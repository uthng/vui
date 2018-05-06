<template>
  <v-layout row justify-center align-center>
    <v-dialog :value="value" persistent fullscreen content-class="dialog-loading" @input="$emit('input', $event.target.value)">
      <v-container fill-height>
        <v-layout column justify-center align-center>
          <v-progress-circular :size="size" :width="width" :color="color" indeterminate />
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
    },
    color: {
      default: "white",
      type: String
    },
    width: {
      default: 10,
      type: Number
    },
    size: {
      default: 150,
      type: Number
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
