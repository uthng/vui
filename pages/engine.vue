<template>
  <div>
    <v-dialog v-model="dlgEditItem" persistent max-width="700px">
      <v-btn slot="activator" color="primary" class="mb-2" dark>New Engine</v-btn>
      <v-card>
        <v-card-title>
          <span class="headline">{{ formTitle }}</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md class="px-3">
            <v-layout row wrap>
              <v-flex xs12>
                <v-select
                  v-model="editedItem.type"
                  :items="listSecretTypes"
                  :disabled="formFieldEnabled"
                  name="item-type"
                  label="Type:"
                  item-text="name"
                  item-value="type"
                  item-disabled="disabled"
                  single-line
                  required
                />
              </v-flex>
              <v-flex xs12>
                <v-text-field
                  v-model="editedItem.path"
                  :rules="[(value) => (value.match(/^[a-zA-Z0-9][a-zA-Z0-9_-]+[a-zA-Z0-9]$/) !== null) || 'Method path must contain only: [a-zA-Z0-9_-] and must not be started or ended by - or  _']"
                  :disabled="formFieldEnabled"
                  name="item-path"
                  label="Path:"
                  required
                />
              </v-flex>
              <v-flex xs12>
                <v-text-field
                  v-model="editedItem.description"
                  name="item-description"
                  label="Description:"
                  multi-line
                />
              </v-flex>
              <v-flex xs6>
                <v-text-field
                  v-model="editedItem.config.default_lease_ttl"
                  name="item-default_lease_ttl"
                  label="Default lease TTL:"
                />
              </v-flex>
              <v-flex xs6>
                <v-text-field
                  v-model="editedItem.config.max_lease_ttl"
                  name="item-max_lease_ttl"
                  label="Max lease TTL:"
                />
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click.stop="closeDlgItem()">Close</v-btn>
          <v-btn color="primary" @click.stop="saveItem()">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dlgDeleteItem" persistent max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Delete Engine</span>
        </v-card-title>
        <v-card-text>
          Are you sure to delete the following method corresponding to the path: <b><span class="red--text text--lighten-2">{{ editedItem.path }}</span></b> ?
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" flat @click.stop="closeDlgItem()">Close</v-btn>
          <v-btn color="primary" flat @click.stop="deleteItem()">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-data-table
      :headers="headers"
      :items="engines"
      hide-actions
      class="elevation-1 body-1"
      item-key="path"
    >
      <template slot="items" slot-scope="props">
        <tr>
          <td class="text-xs-left body-1">{{ props.item.path }}</td>
          <td class="text-xs-left body-1">{{ props.item.description }}</td>
          <td class="text-xs-left body-1">{{ props.item.type }}</td>
          <td class="text-xs-left body-1">{{ props.item.config.default_lease_ttl }}</td>
          <td class="text-xs-left body-1">{{ props.item.config.max_lease_ttl }}</td>
          <td class="justify-center layout px-0">
            <v-btn icon class="mx-0" @click="openDlgItem(props.item, 'edit')">
              <v-icon color="teal">edit</v-icon>
            </v-btn>
            <v-btn icon class="mx-0" @click="openDlgItem(props.item, 'delete')">
              <v-icon color="pink">delete</v-icon>
            </v-btn>
          </td>
        </tr>
      </template>
      <template slot="no-data">
        <v-alert :value="true" color="error" icon="warning">
          Sorry, nothing to display here :(
        </v-alert>
      </template>
    </v-data-table>
    <loader v-model="dlgLoading"/>
  </div>
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
      headers: [
        { text: "Path", value: "path", align: "left" },
        { text: "Description", value: "description", align: "left" },
        { text: "Type", value: "type", align: "left" },
        {
          text: "Default Lease TTL",
          value: "default_lease_ttl",
          align: "left"
        },
        {
          text: "Max Lease TTL",
          value: "max_lease_ttl",
          align: "left"
        },
        { text: "Actions", value: "actions", sortable: false, align: "left" }
      ],
      dlgLoading: false,
      dlgEditItem: false,
      dlgDeleteItem: false,
      editedIndex: -1,
      editedItem: {
        path: "",
        description: "",
        type: "",
        config: {
          default_lease_ttl: "",
          max_lease_ttl: "",
          force_no_cache: false,
          plugin_name: "",
          audit_non_hmac_request_keys: [],
          audit_non_hmac_response_keys: [],
          listing_visibility: "",
          passthrough_request_headers: []
        },
        plugin_name: "",
        local: false,
        seal_wrap: false
      },
      defaultItem: {
        path: "",
        description: "",
        type: "",
        config: {
          default_lease_ttl: "",
          max_lease_ttl: "",
          force_no_cache: false,
          plugin_name: "",
          audit_non_hmac_request_keys: [],
          audit_non_hmac_response_keys: [],
          listing_visibility: "",
          passthrough_request_headers: []
        },
        plugin_name: "",
        local: false,
        seal_wrap: false
      },
      listSecretTypes: [
        { type: "consul", name: "Consul", disabled: false },
        { type: "kv", name: "Secret", disabled: false },
        { type: "cubbyhole", name: "Cubbyhole", disabled: true },
        { type: "aws", name: "AWS", disabled: true },
        { type: "database", name: "Databases", disabled: true },
        { type: "gcp", name: "Google Cloud", disabled: true },
        { type: "identity", name: "Identity", disabled: false },
        { type: "nomad", name: "Nomad", disabled: true },
        { type: "pki", name: "PKI", disabled: true },
        { type: "rabbitmq", name: "RabbitMQ", disabled: true },
        { type: "ssh", name: "SSH", disabled: true },
        { type: "totp", name: "TOTP", disabled: true },
        { type: "transit", name: "Transit", disabled: true }
      ]
    }
  },
  computed: {
    engines: function() {
      return this.$store.state.listSecretEngines
    },
    formTitle: function() {
      return this.editedIndex === -1 ? "New Engine" : "Edit Engine"
    },
    formFieldEnabled: function() {
      return this.editedIndex === -1 ? false : true
    }
    // We comment this function because we can mount the same auth type
    // on different paths
    // listSecretTypes: function() {
    //  let engines = this.$store.state.listSecretEngines
    //  let authTypes = [
    //    { type: "ldap", name: "LDAP", disabled: false },
    //    { type: "token", name: "Token", disabled: false },
    //    { type: "approle", name: "AppRole", disabled: false },
    //    { type: "github", name: "Github", disabled: false },
    //    { type: "userpass ", name: "Username & password", disabled: false }
    //  ]

    //  return authTypes.map(authType => {
    //    let m = engines.filter(method => {
    //      return method.type === authType.type
    //    })

    //    authType.disabled = m.length > 0 ? true : false
    //    return authType
    //  })
    //}
  },
  mounted: async function() {
    try {
      this.dlgLoading = true
      let engines = await this.$vault.secret.getEngines(this.$store.state.vtok)

      this.$store.dispatch("updateListSecretEngines", engines)
      this.dlgLoading = false
    } catch (err) {
      this.dlgLoading = false
      this.showMsg({ type: "error", message: err })
    }
  },
  methods: {
    deleteItem: async function() {
      try {
        let engines = _.cloneDeep(this.engines)

        this.dlgLoading = true
        await this.$vault.secret.deleteEngine(
          this.editedItem.path,
          this.$store.state.vtok
        )

        engines.splice(this.editedIndex, 1)

        this.$store.dispatch("updateListSecretEngines", engines)
        this.showMsg({
          message:
            "The engine corresponding to the path " +
            this.editedItem.path +
            " has been deleted correctly !"
        })

        this.closeDlgItem()
      } catch (error) {
        this.closeDlgItem()
        this.showMsg({ type: "error", message: error })
      }
    },
    saveItem: async function() {
      try {
        let engines = _.cloneDeep(this.engines)

        this.dlgLoading = true

        if (this.editedIndex > -1) {
          await this.$vault.secret.updateEngine(
            this.editedItem,
            this.$store.state.vtok
          )
        } else {
          await this.$vault.secret.createEngine(
            this.editedItem,
            this.$store.state.vtok
          )
        }

        if (this.editedIndex > -1) {
          Object.assign(engines[this.editedIndex], this.editedItem)
        } else {
          engines.push(this.editedItem)
        }

        this.$store.dispatch("updateListSecretEngines", engines)
        this.showMsg({
          message:
            "The engine corresponding to the path " +
            this.editedItem.path +
            " has been saved correctly !"
        })

        this.closeDlgItem()
      } catch (error) {
        this.closeDlgItem()
        this.showMsg({ type: "error", message: error })
      }
    },
    openDlgItem: function(item, op) {
      this.editedIndex = this.engines.indexOf(item)
      this.editedItem = _.cloneDeep(item)
      if (op === "edit") {
        this.dlgEditItem = true
      } else {
        this.dlgDeleteItem = true
      }
    },
    closeDlgItem: function() {
      this.dlgLoading = false
      this.dlgEditItem = false
      this.dlgDeleteItem = false

      this.editedIndex = -1
      this.editedItem = Object.assign({}, this.defaultItem)
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
.line-break-and-tab {
  white-space: pre-wrap;
}
</style>
