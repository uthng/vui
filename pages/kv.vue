<template>
  <v-container fluide>
    <v-layout row justify-center align-center>
      <v-flex xs12>
        <v-select
          v-model="selectedSecret"
          :items="listSecrets"
          label="Secret Paths:"
          item-text="path"
          item-value="path"
          item-disabled="disabled"
          required
          @input="loadData"
        />
      </v-flex>
    </v-layout>
    <v-layout row wrap>
      <v-flex xs12>
        <vault-view :data="jsonSource" :unfold-paths="policyPaths" :options="{maxDepth: 7}" @get-secret-kv="getSecretRecurseKV"/>
      </v-flex>
    </v-layout>
    <loader v-model="dlgLoading"/>
  </v-container>
</template>


<script>
import _ from "lodash"
import VaultView from "~/components/vault-editor/VaultView.vue"
import Loader from "~/components/loader/loader.vue"
import object from "~/utils/object"

export default {
  components: {
    VaultView,
    Loader
  },
  data() {
    return {
      dlgLoading: false,
      selectedSecret: "",
      listSecrets: []
    }
  },
  computed: {
    jsonSource: function() {
      return this.$store.state.secretPathObject
    },
    policyPaths: function() {
      return this.$store.state.policyPaths
    }
  },
  mounted: async function() {
    this.dlgLoading = true

    // Listen event to list/get secret kv path
    this.$root.$on("get-secret-kv", data => {
      this.getSecretRecurseKV(data)
    })

    // Listen event to add path
    this.$root.$on("add-secret-path", data => {
      this.addSecretPath(data)
    })

    // Listen event to delete path
    this.$root.$on("delete-secret-path", data => {
      this.deleteSecretPath(data)
    })

    // Listen event to update value path
    this.$root.$on("update-secret-path-value", data => {
      this.updateSecretPathValue(data)
    })

    // Listen event to delete value path
    this.$root.$on("delete-secret-path-value", data => {
      this.deleteSecretPathValue(data)
    })

    try {
      // Get all LDAP mounted methods
      let engines = await this.$vault.secret.getEngines(this.$store.state.vtok)
      this.listSecrets = engines
        .filter(engine => {
          return engine.type === "kv"
        })
        .map(secret => {
          return { path: secret.path, disabled: true }
        })
      //this.selectedSecret = this.listSecrets[0].path

      // If user is root, add all mounted secrets with full capabilities in
      // policy paths. Otherwise build it by filtering with secret paths
      // And enable all secret engine in select menu
      let arrPolicyPaths = []
      if (this.$store.state.user === "root") {
        arrPolicyPaths = this.listSecrets.map(secret => {
          return {
            path: secret.path + "/*",
            capabilities: ["create", "update", "delete", "read", "list"]
          }
        })

        this.listSecrets = this.listSecrets.map(secret => {
          secret.disabled = false
          return secret
        })
      } else {
        // Build an array of policy paths filtering with secret path
        let infos = await this.$vault.token.getTokenInfos(
          this.$store.state.vtok
        )
        let i = 0

        // Just looping policies and add only keys begining with secret/
        for (i = 0; i < infos.policies.length; i++) {
          let path = infos.policies[i].rules.path
          for (var key in path) {
            if (path.hasOwnProperty(key)) {
              for (var j = 0; j < this.listSecrets.length; j++) {
                if (key.startsWith(this.listSecrets[j].path + "/")) {
                  arrPolicyPaths.push({
                    path: key,
                    capabilities: path[key].capabilities
                  })

                  // Enable secret engine select menu because at least
                  // one key in policy path contains it
                  this.listSecrets[j].disabled = false
                }
              }
            }
          }
        }
      }

      //console.log("arrPolicyPaths: " + JSON.stringify(arrPolicyPaths))
      this.$store.dispatch("updatePolicyPaths", arrPolicyPaths)

      // Load page's data
      this.loadData()

      this.dlgLoading = false
    } catch (error) {
      this.dlgLoading = false
      this.showMsg({ type: "error", message: error })
    }
  },
  methods: {
    loadData: async function() {
      // Reinitialize secret path object stored in state
      this.$store.dispatch("updateSecretPathObject", {})

      // Get only policy paths matching with selected secret path
      let arrPolicyPaths = this.$store.state.policyPaths.filter(policy => {
        return policy.path.startsWith(this.selectedSecret + "/")
      })

      for (var i = 0; i < arrPolicyPaths.length; i++) {
        let key = arrPolicyPaths[i].path
        let keyWithoutGlob
        let keyParent

        // Check if the key contains glob character (*) at the end.
        // It is not a regular expression (as indicated in Vault docs)
        if (key.endsWith("*")) {
          keyWithoutGlob = key.replace("*", "")
          // For the vault tree view, we can not let secret/travel/team-
          // (because * is replaced above), so we also need to remove team-
          let lastIdx = keyWithoutGlob.lastIndexOf("/")
          keyParent = keyWithoutGlob.substr(0, lastIdx + 1)
        } else {
          keyWithoutGlob = key
          keyParent = key
        }

        // Check If the key or its parents are not in policy path
        // from 0 to current position, then call it 1st time recursively
        if (!this.checkKeyInPolicyPath(keyParent, i, arrPolicyPaths)) {
          // console.log('policyPath keyParent: ' + keyParent)
          await this.getSecretRecurseKV(keyParent)
        }
      }
    },
    // This function checks if a key or parent key is already
    // in the policy paths ? If yes, it means that a call recursive
    // to get all child keys has been performed
    checkKeyInPolicyPath: function(key, index, paths) {
      for (var i = 0; i < index; i++) {
        let lastIdx = paths[i].path.lastIndexOf("/")
        let path = paths[i].path.substr(0, lastIdx + 1)
        if (path.length >= key.length) {
          if (path.startsWith(key)) {
            return true
          }
        } else {
          if (key.startsWith(path)) {
            return true
          }
        }
      }

      return false
    },
    getSecretRecurseKV: async function(path) {
      try {
        this.dlgLoading = true
        let currentMapKeys = _.cloneDeep(this.$store.state.secretPathObject)
        // console.log('currentMapKeys before: ' + JSON.stringify(currentMapKeys))
        let keys = await this.$vault.kv.getSecretRecurseKeys(
          path,
          this.$store.state.vtok
        )

        // console.log('getSecretRecurseKV path: ' + path + ' keys: ' + JSON.stringify(keys))
        for (var i = 0; i < keys.length; i++) {
          let k = keys[i]

          // Add new key to map if it does not exist
          object.createObjectByPath(currentMapKeys, "/", k.key, null)
          // Add values of key
          if (!k.key.endsWith("/")) {
            // Then loop to key/value of value object to add all values of key
            for (var key in k.value) {
              if (k.value.hasOwnProperty(key)) {
                object.createObjectByPath(
                  currentMapKeys,
                  "/",
                  k.key + "/" + key,
                  k.value[key]
                )
              }
            }
          }
        }

        //console.log("currentMapKeys after: " + JSON.stringify(currentMapKeys))
        this.$store.dispatch("updateSecretPathObject", currentMapKeys)
        this.dlgLoading = false
      } catch (error) {
        this.dlgLoading = false
        this.showMsg({ type: "error", message: error })
      }
    },
    addSecretPath: async function(modifiedPath) {
      let currentMapKeys = _.cloneDeep(this.$store.state.secretPathObject)
      let path = modifiedPath.parent + modifiedPath.path

      // Update locally modified path in store
      object.createObjectByPath(
        currentMapKeys,
        "/",
        path + "/" + modifiedPath.key,
        modifiedPath.value
      )

      // Get newValue to update to Vault
      let newValue = object.getObjectValueByPath(currentMapKeys, "/", path)
      // console.log('path: ' + path + " newvalue: " + JSON.stringify(newValue))

      // Update to Vault
      try {
        await this.$vault.kv.createSecretKeyValue(
          path,
          newValue,
          this.$store.state.vtok
        )

        //console.log('currentMapKeys: ' + JSON.stringify(currentMapKeys))
        this.$store.dispatch("updateSecretPathObject", currentMapKeys)

        this.showMsg({
          message:
            "New secret " + path + " has been created/update successfully"
        })
      } catch (error) {
        this.showMsg({ type: "error", message: error })
      }
    },
    // We cannot remove directory path, only value path,
    // so deletedPath will be never ended by '/'
    deleteSecretPath: async function(deletedPath) {
      let currentMapKeys = _.cloneDeep(this.$store.state.secretPathObject)

      // Update locally modified path in store
      object.removeObjectByPath(currentMapKeys, "/", deletedPath)
      // Loop parent paths to delete all directory paths having no child like Vault does
      let path = deletedPath
      let value = {}
      do {
        path = path.substr(0, path.lastIndexOf("/"))
        value = object.getObjectValueByPath(currentMapKeys, "/", path)
        console.log("path " + path + " value " + _.isEmpty(value))
        if (_.isEmpty(value)) {
          object.removeObjectByPath(currentMapKeys, "/", path)
        }
      } while (_.isEmpty(value) && path.lastIndexOf("/") > 0)

      // Update to Vault
      try {
        await this.$vault.kv.deleteSecretKeyValue(
          deletedPath,
          this.$store.state.vtok
        )

        console.log("currentMapKeys: " + JSON.stringify(currentMapKeys))
        this.$store.dispatch("updateSecretPathObject", currentMapKeys)

        this.showMsg({
          message:
            "The secret " + deletedPath + " has been removed successfully"
        })
      } catch (error) {
        this.showMsg({ type: "error", message: error })
      }
    },
    updateSecretPathValue: async function(modifiedPath) {
      let currentMapKeys = _.cloneDeep(this.$store.state.secretPathObject)
      let path = modifiedPath.path + modifiedPath.key

      // Update locally modified path in store
      object.createObjectByPath(currentMapKeys, "/", path, modifiedPath.value)

      // Get parent path and do work with
      path = path.substr(0, path.lastIndexOf("/"))
      // Get newValue to update to Vault
      let newValue = object.getObjectValueByPath(currentMapKeys, "/", path)

      // console.log('path: ' + path + ' value: ' + JSON.stringify(newValue))

      // Update to Vault
      try {
        await this.$vault.kv.createSecretKeyValue(
          path,
          newValue,
          this.$store.state.vtok
        )

        //console.log('currentMapKeys: ' + JSON.stringify(currentMapKeys))
        this.$store.dispatch("updateSecretPathObject", currentMapKeys)

        this.showMsg({
          message:
            "New secret path value " +
            modifiedPath.path +
            modifiedPath.key +
            " has been created/update successfully"
        })
      } catch (error) {
        this.showMsg({ type: "error", message: error })
      }
    },
    deleteSecretPathValue: async function(deletedPath) {
      let currentMapKeys = _.cloneDeep(this.$store.state.secretPathObject)
      let path = deletedPath.path.substr(0, deletedPath.path.lastIndexOf("/"))

      // Update locally modified path in store
      object.removeObjectByPath(
        currentMapKeys,
        "/",
        path + "/" + deletedPath.key
      )

      // Get newValue to update to Vault
      let newValue = object.getObjectValueByPath(currentMapKeys, "/", path)
      // console.log('path: ' + path + ' value: ' + JSON.stringify(newValue))

      // if the new value is empty after deleting, it means that
      // no value exists anymore in the value path, so delete all empty parent
      // objects recursively
      if (_.isEmpty(newValue)) {
        let value = newValue
        let p = path
        while (_.isEmpty(value) && p.lastIndexOf("/") > 0) {
          object.removeObjectByPath(currentMapKeys, "/", p)
          p = p.substr(0, p.lastIndexOf("/"))
          value = object.getObjectValueByPath(currentMapKeys, "/", p)
          // console.log("path " + p + " value " + _.isEmpty(value) )
        }
      }

      // Update to Vault
      try {
        // if there is still any value existing in value path, so just update
        // else it is the last value of value path, so delete value path directly
        if (!_.isEmpty(newValue)) {
          await this.$vault.kv.createSecretKeyValue(
            path,
            newValue,
            this.$store.state.vtok
          )
        } else {
          await this.$vault.kv.deleteSecretKeyValue(
            path,
            this.$store.state.vtok
          )
        }

        //console.log('currentMapKeys: ' + JSON.stringify(currentMapKeys))
        this.$store.dispatch("updateSecretPathObject", currentMapKeys)

        this.showMsg({
          message:
            "The secret path value " +
            deletedPath.path +
            deletedPath.key +
            " has been removed successfully"
        })
      } catch (error) {
        this.showMsg({ type: "error", message: error })
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
