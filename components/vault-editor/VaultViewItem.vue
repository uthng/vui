<template>
  <div v-if="isObject(data) || isArray(data)">
    <div :class="getClassDepth(currentDepth)" class="item item-leaf">
      <div class="item-node" @click.stop="toggleOpen()">
        <span :class="{opened: isOpen()}" class="item-key item-key-with-chevron">{{ getKey(data) }}</span>
        <span v-show="!isOpen() && data.children.length === 1" class="item-hint"> ({{ data.children.length }} {{ isObject(data) ? 'property' : 'item' }})</span>
        <span v-show="!isOpen() && data.children.length !== 1" class="item-hint"> ({{ data.children.length }} {{ isObject(data) ? 'properties' : 'items' }})</span>
        <span class="item-actions">
          <v-btn :disabled="isBtnDisabled('refresh')" icon small class="ma-0 pa-0" @click.stop="emitGetSecretKV()"><v-icon small>refresh</v-icon></v-btn>
          <v-btn :disabled="isBtnDisabled('edit')" icon small class="ma-0 pa-0"><v-icon small>edit</v-icon></v-btn>
          <v-btn :disabled="isBtnDisabled('add')" icon small class="ma-0 pa-0" @click.stop="dlgCreateSecret = true"><v-icon small>add</v-icon></v-btn>
          <v-btn :disabled="isBtnDisabled('delete')" icon small class="ma-0 pa-0" @click.stop="dlgDeleteSecret = true"><v-icon small>delete</v-icon></v-btn>
        </span>
      </div>
    </div>
    <vault-view-item v-for="child in data.children" v-show="isOpen()" :key="getKey(child)" :unfold-paths="unfoldPaths" :max-depth="maxDepth" :current-depth="currentDepth+1" :data="child" :path="getPath(child)" :modifiable="modifiable" @change-data="onChangeData"/>

    <v-dialog v-model="dlgCreateSecret" persistent max-width="700px">
      <v-card>
        <v-card-title>
          <span class="headline">Create Key Value</span>
        </v-card-title>
        <v-card-text>
          <v-container fluid class="px-3">
            <v-layout row wrap>
              <v-flex xs12>
                <v-text-field
                  :value="path"
                  name="key-parent"
                  label="Path parent"
                  disabled
                  box
                />
              </v-flex>
              <v-flex xs12>
                <v-text-field
                  v-if="path.endsWith('/')"
                  v-model="newSecret.path"
                  :rules="[(value) => !value.endsWith('/') || 'The secret path must not be ended by /']"
                  name="new-path"
                  label="Path"
                  hint="The new secret must no be ended by '/'"
                  box
                  required
                />
              </v-flex>

              <v-flex xs12>
                <v-text-field
                  v-model="newSecret.key"
                  name="new-key"
                  label="Key"
                  persistent-hint
                  box
                  required
                />
              </v-flex>
              <v-flex xs12>
                <v-text-field
                  v-model="newSecret.value"
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
          <v-btn color="primary" flat @click.stop="dlgCreateSecret=false">Close</v-btn>
          <v-btn color="primary" flat @click.stop="saveCreatedSecret()">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dlgDeleteSecret" persistent max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Delete Key Value</span>
        </v-card-title>
        <v-card-text>
          Are you sure to delete the following key path: <b><span class="red--text text--lighten-2">{{ path }}</span></b> ?
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" flat @click.stop="dlgDeleteSecret=false">Close</v-btn>
          <v-btn color="primary" flat @click.stop="deleteSecret()">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
  <vault-view-item-value v-else-if="isValue(data)" :key-string="getKey(data)" :data="data.value" :path="path" :modifiable="modifiable" :current-depth="currentDepth" class="item item-leaf" @change-data="onChangeData"/>

</template>

<script>
import _ from "lodash"
import VaultViewItemValue from "~/components/vault-editor/VaultViewItemValue.vue"

export default {
  name: "VaultViewItem",
  components: {
    VaultViewItemValue
  },
  props: {
    data: {
      type: Object,
      required: true
    },
    maxDepth: {
      type: Number,
      default: 7
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
    unfoldPaths: {
      type: Array,
      required: true
    }
  },
  data: function() {
    return {
      open: this.currentDepth < this.maxDepth,
      // open: false,
      dlgDeleteSecret: false,
      dlgCreateSecret: false,
      newSecret: { parent: this.path, path: "", key: "", value: "" }
    }
  },
  // watch: {
  //  keyChild: function (oldChild, newChild) {
  //    if (this.keyChild[this.keyChild.length - 1] == "/") {
  //      this.displayKeyValueField = false
  //    }
  //    else {
  //      this.displayKeyValueField = true
  //    }
  //  }
  // },
  computed: {
    capabilities() {
      return this.getPathCapabilities()
    }
  },
  methods: {
    isOpen: function() {
      return this.open
    },
    toggleOpen: function() {
      this.open = !this.open
    },
    emitGetSecretKV: function() {
      // if path empty = root => emit nothing
      if (this.path !== "") {
        this.$root.$emit("get-secret-kv", this.path)
      }
    },
    // In this function, we try to get capabilities of the current path
    // within unfoldPaths array and try to match it to action buttons
    // refresh, list = read, delete = delete, edit = update, create = add
    getPathCapabilities: function() {
      let capabilities = []

      // If path = root
      if (this.path === "") {
        return capabilities
      }

      //console.log(JSON.stringify(this.unfoldPaths))
      // Check if key in path, if not disable all
      for (var i = 0; i < this.unfoldPaths.length; i++) {
        let unfoldPath = this.unfoldPaths[i]
        if (unfoldPath.path == this.path) {
          // console.log('path =: ' + this.path + ' capabilities ' + unfoldPath.capabilities)
          return unfoldPath.capabilities
          // }
          // else if (unfoldPath.path.length > this.path.length) {
          //  if (unfoldPath.path.startsWith(this.path)) {
          //    console.log('path <: ' + this.path + ' capabilities ' + unfoldPath.capabilities)
          //    capabilities = unfoldPath.capabilities
          //  }
        } else {
          // if unfoldPath's length > current key, then return capabilities empty because we dont have
          // permissions to do anything else on the parent path
          // if current key path > unfoldPath and unfoldPath is suffixed with glob character (*), it means
          // that same permissions will be applied on its childs so, we can return unfoldPath capabilities.
          if (
            unfoldPath.path.endsWith("*") &&
            this.path.startsWith(unfoldPath.path.replace("*", ""))
          ) {
            // console.log('path >: ' + this.path + ' capabilities ' + unfoldPath.capabilities)
            capabilities = unfoldPath.capabilities
          }
        }
      }

      //console.log('path final: ' + this.path + ' capabilities ' + capabilities)
      return capabilities
    },
    isBtnDisabled: function(btnName) {
      let capability = btnName

      if (btnName === "refresh" || btnName === "list") {
        capability = "read"
      }

      if (btnName === "add") {
        capability = "create"
      }

      if (btnName === "edit") {
        capability = "update"
      }

      if (this.capabilities.length == 0) {
        return true
      }

      if (this.capabilities.indexOf(capability) >= 0) {
        // Cas specific to disable edit & delete actions on directory path or path having children
        // In vault, we cannot delete a directory path, we must delete value path and Vault does
        // the rest (remove of parent directory is empty)
        if (
          (capability === "update" || capability === "delete") &&
          this.getChildType(this.data) !== "value"
        ) {
          return true
        }

        // Disable button edit on value path
        if (
          capability === "update" &&
          this.getChildType(this.data) === "value"
        ) {
          return true
        }

        return false
      }

      return true
    },
    // Check if the current item has a child and
    // its child has any child of array for object type
    getChildType: function(data) {
      //console.log('pathhhhhhhhhhhhhhhh ' + data.key + ' children ' + JSON.stringify(data.children))
      if (this.isObject(data) || this.isArray(data)) {
        for (var i = 0; i < data.children.length; i++) {
          let child = data.children[i]
          //console.log('childddddddddd ' + JSON.stringify(child))
          if (this.isObject(child) || this.isArray(child)) {
            return child.type
          }
        }
      }

      return "value"
    },
    isObject: function(value) {
      return value.type === "object"
    },
    isArray: function(value) {
      return value.type === "array"
    },
    isValue: function(value) {
      return value.type === "value"
    },
    getType: function(value) {
      return value.type
    },
    getKey: function(value) {
      if (_.isInteger(value.key)) {
        return value.key + ":"
      } else {
        return value.key
      }
    },
    getPath: function(data) {
      var path
      if (this.path === undefined) {
        return data.key + "/"
      }

      if (data.isRoot) {
        return ""
      }

      if (this.isValue(data)) {
        path = this.path + "/" + data.key
      } else {
        // if child type is value so its parent must not be ended with "/" in the path
        if (this.getChildType(data) !== "value") {
          path = this.path + data.key + "/"
        } else {
          path = this.path + data.key
        }
      }

      return path
    },
    isRootObject: function(value = this.data) {
      return value.isRoot
    },
    onChangeData: function(path, value) {
      path = _.concat(this.data.key, path)
      this.$emit("change-data", path, value)
    },
    getClassDepth: function(depth) {
      return "depth-" + depth
    },
    saveCreatedSecret: function() {
      this.$root.$emit("add-secret-path", this.newSecret)
      this.dlgCreateSecret = false
    },
    deleteSecret: function() {
      this.$root.$emit("delete-secret-path", this.path)
      this.dlgDeleteSecret = false
    }
  },
  notifications: {
    showMsg: {
      type: "success",
      title: "Create Key Value",
      message: "The new key has been created correctly"
    }
  }
}
</script>

<style>
.item {
  font-family: monaco, monospace;
  font-size: 14px;
  /*margin-left: 15px;*/
  padding: 5px;
}

.item-node {
  cursor: pointer;
  position: relative;
  white-space: nowrap;
}

.item-leaf {
  white-space: nowrap;
}

.item-key {
  font-weight: bold;
}

.item-key-with-chevron {
  padding-left: 5px;
}

.item-key-with-chevron.opened::before {
  top: 0px;
  transform: rotate(90deg);
  -webkit-transform: rotate(90deg);
}

.item-key-with-chevron::before {
  color: #444;
  content: "\25b6";
  font-size: 15px;
  left: -10px;
  position: absolute;
  top: -1px;
  transition: -webkit-transform 0.1s ease;
  transition: transform 0.1s ease;
  transition: transform 0.1s ease, -webkit-transform 0.1s ease;
  -webkit-transition: -webkit-transform 0.1s ease;
}

.item-hint {
  color: #ccc;
}

.item-actions {
  position: absolute;
  right: 10px;
  top: -5px;
}

.depth-0 {
  padding-left: 0px;
}

.depth-1 {
  padding-left: 15px;
}

.depth-2 {
  padding-left: 35px;
}

.depth-3 {
  padding-left: 55px;
}

.depth-4 {
  padding-left: 75px;
}

.depth-5 {
  padding-left: 95px;
}

.depth-6 {
  padding-left: 115px;
}

.depth-7 {
  padding-left: 135px;
}

.depth-8 {
  padding-left: 155px;
}

.depth-9 {
  padding-left: 175px;
}

.depth-10 {
  padding-left: 195px;
}
</style>
