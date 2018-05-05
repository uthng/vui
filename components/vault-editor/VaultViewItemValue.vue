<template>
  <div class="item-key-value">
    <div :class="getClassDepth(currentDepth)" class="item-key">{{ keyString }}:</div>
    <input v-if="modifiable" :class="getValueType(data)" v-model="valueString" class="item-value" @keyup.enter="onUpdateData" @blur="onUpdateData">
    <div v-else :class="getValueType(data)" class="item-value">{{ valueFormed }}</div>
    <div class="item-icons">
      <v-btn icon small class="ma-0 pa-0" @click.stop="openDlgModifySecretValue()"><v-icon small>edit</v-icon></v-btn>
      <v-btn icon small disabled class="ma-0 pa-0"><v-icon small>add</v-icon></v-btn>
      <v-btn icon small class="ma-0 pa-0" @click.stop="openDlgDeleteSecretValue()"><v-icon small>delete</v-icon></v-btn>
    </div>
    <v-dialog v-model="dlgModifySecretValue" persistent max-width="700px">
      <v-card>
        <v-card-title>
          <span class="headline">Modify Key Value</span>
        </v-card-title>
        <v-card-text>
          <v-container fluid class="px-3">
            <v-layout row wrap>
              <v-flex xs12>
                <v-text-field
                  v-model="modifiedSecret.path"
                  name="secret-path"
                  label="Path"
                  box
                  disabled
                />
              </v-flex>

              <v-flex xs12>
                <v-text-field
                  v-model="modifiedSecret.key"
                  name="new-key"
                  label="Key"
                  persistent-hint
                  box
                  disabled
                />
              </v-flex>
              <v-flex xs12>
                <v-text-field
                  v-model="modifiedSecret.value"
                  name="new-value"
                  label="Value"
                  multi-line
                  rows="10"
                  box
                  required
                />
              </v-flex>

            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" flat @click.stop="dlgModifySecretValue=false">Close</v-btn>
          <v-btn color="primary" flat @click.stop="saveModifiedSecretValue()">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dlgDeleteSecretValue" persistent max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Delete Key Value</span>
        </v-card-title>
        <v-card-text>
          Are you sure to delete the following value path: <b><span class="red--text text--lighten-2">{{ path }}</span></b> ?
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" flat @click.stop="dlgDeleteSecretValue=false">Close</v-btn>
          <v-btn color="primary" flat @click.stop="deleteSecretValue()">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>

</template>


<script>
import _ from "lodash"

export default {
  name: "VaultViewItem",
  props: {
    data: {
      type: Object,
      required: true
    },
    currentDepth: {
      type: Number,
      required: true
    },
    modifiable: {
      type: Boolean,
      default: false
    },
    path: {
      type: String,
      required: true
    },
    keyString: {
      type: String,
      required: true
    }
  },
  data: function() {
    return {
      valueString: this.data && this.data.toString(),
      error: false,
      dlgModifySecretValue: false,
      dlgDeleteSecretValue: false,
      modifiedSecret: { path: "", key: "", value: "" }
    }
  },
  computed: {
    valueFormed: function() {
      return this.getValue(this.data)
    }
  },
  methods: {
    onUpdateData: function() {
      try {
        let v = this.typedValue(this.valueString)
        this.error = false
        this.$emit("change-data", [], v)
      } catch (err) {
        this.error = err
      }
    },
    typedValue: function(v) {
      if (v === "") {
        throw new Error("empty")
      }

      let dataType = this.getValueType(this.data, "")

      switch (dataType) {
        case "number":
          if (_.isNaN(_.toNumber(v))) {
            throw new Error("only number")
          }
          return _.toNumber(v)
        case "boolean":
          if (v.toLowerCase() === "true") {
            return true
          }
          if (v.toLowerCase() === "false") {
            return false
          }
          throw new Error("true or false")
        case "string":
        default:
          return v
      }
    },
    getValue: function(value) {
      if (_.isNumber(value)) {
        return value
      }
      if (_.isNull(value)) {
        return null
      }
      if (_.isString(value)) {
        // return '"' + value + '"'
        return value
      }
      return value
    },
    getValueType: function(value, prefix = "item-value-") {
      if (_.isNumber(value)) {
        return prefix + "number"
      }
      if (_.isFunction(value)) {
        return prefix + "function"
      }
      if (_.isBoolean(value)) {
        return prefix + "boolean"
      }
      if (_.isNull(value)) {
        return prefix + "null"
      }
      if (_.isString(value)) {
        return prefix + "string"
      }
      return prefix + "unknown"
    },
    getClassDepth: function(depth) {
      return "depth-" + depth
    },
    openDlgModifySecretValue: function() {
      // Just take parent path
      this.modifiedSecret.path = this.path.substr(
        0,
        this.path.lastIndexOf("/") + 1
      )
      this.modifiedSecret.key = this.keyString
      this.modifiedSecret.value = this.valueFormed
      this.dlgModifySecretValue = true
    },
    saveModifiedSecretValue: function() {
      this.$root.$emit("update-secret-path-value", this.modifiedSecret)
      this.dlgModifySecretValue = false
    },
    openDlgDeleteSecretValue: function() {
      // Just take parent path
      this.modifiedSecret.path = this.path.substr(
        0,
        this.path.lastIndexOf("/") + 1
      )
      this.modifiedSecret.key = this.keyString
      this.dlgDeleteSecretValue = true
    },
    deleteSecretValue: function() {
      this.$root.$emit("delete-secret-path-value", this.modifiedSecret)
      this.dlgDeleteSecretValue = false
    }
  },
  notifications: {
    showSuccessModifMsg: {
      type: "success",
      title: "Modify Key Value",
      message: "The new key's value has been saved correctly"
    },
    showSuccessDeleteMsg: {
      type: "success",
      title: "Delete Key Value",
      message: "The path has been deleted correctly"
    }
  }
}
</script>

<style>
/* div horizontally: */
/* parent overflow: hidden, child: float left */
/* or usung flex */
.item-key-value {
  display: flex;
  flex-direction: row;
  /*overflow: hidden;*/
}

.item-key {
  /*float: left;*/
  flex: 1;
  justify-content: flex-start;
}

.item-value {
  white-space: normal;
  width: 100%;
  word-break: break-all;
  text-align: justify;
  float: right;
  padding-right: 40px;
  padding-left: 10px;
  justify-content: center;
}

.item-icons {
  flex: 1;
  justify-content: flex-end;
  margin-right: 10px;
  margin-top: -5px;
}
</style>
