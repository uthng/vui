<template>
  <div>
    <v-dialog v-model="dlgEditItem" persistent max-width="700px">
      <v-btn slot="activator" color="primary" class="mb-2" dark>New Method</v-btn>
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
                  :items="listAuthTypes"
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
                  :rules="[(value) => (value.match(/^[a-zA-Z0-9][a-zA-Z0-9_-]+[a-zA-Z0-9]$/) !== null) || 'The secret path must contain only: [a-zA-Z0-9_-] and must not be started or ended by - or  _']"
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
          <span class="headline">Delete Method</span>
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
      :items="methods"
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
          plugin_name: "",
          audit_non_hmac_request_keys: [],
          audit_non_hmac_response_keys: [],
          listing_visibility: "",
          passthrough_request_headers: []
        },
        plugin_name: "",
        local: false
      },
      defaultItem: {
        path: "",
        description: "",
        type: "",
        config: {
          default_lease_ttl: "",
          max_lease_ttl: "",
          plugin_name: "",
          audit_non_hmac_request_keys: [],
          audit_non_hmac_response_keys: [],
          listing_visibility: "",
          passthrough_request_headers: []
        },
        plugin_name: "",
        local: false
      },
      listAuthTypes: [
        { type: "ldap", name: "LDAP", disabled: false },
        { type: "token", name: "Token", disabled: false },
        { type: "approle", name: "AppRole", disabled: false },
        { type: "github", name: "Github", disabled: false },
        { type: "userpass", name: "Username & password", disabled: false }
      ]
    }
  },
  computed: {
    methods: function() {
      return this.$store.state.listAuthMethods
    },
    formTitle: function() {
      return this.editedIndex === -1 ? "New Method" : "Edit Method"
    },
    formFieldEnabled: function() {
      return this.editedIndex === -1 ? false : true
    }
    // We comment this function because we can mount the same auth type
    // on different paths
    // listAuthTypes: function() {
    //  let methods = this.$store.state.listAuthMethods
    //  let authTypes = [
    //    { type: "ldap", name: "LDAP", disabled: false },
    //    { type: "token", name: "Token", disabled: false },
    //    { type: "approle", name: "AppRole", disabled: false },
    //    { type: "github", name: "Github", disabled: false },
    //    { type: "userpass ", name: "Username & password", disabled: false }
    //  ]

    //  return authTypes.map(authType => {
    //    let m = methods.filter(method => {
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
      let methods = await this.$vault.auth.getMethods(this.$store.state.vtok)

      console.log(methods)
      this.$store.dispatch("updateListAuthMethods", methods)
      this.dlgLoading = false
    } catch (err) {
      this.dlgLoading = false
      this.showMsg({ type: "error", message: err })
    }
  },
  methods: {
    deleteItem: async function() {
      try {
        let methods = _.cloneDeep(this.methods)

        this.dlgLoading = true
        await this.$vault.auth.deleteMethod(
          this.editedItem.path,
          this.$store.state.vtok
        )

        methods.splice(this.editedIndex, 1)

        this.$store.dispatch("updateListAuthMethods", methods)
        this.showMsg({
          message:
            "The method " +
            this.editedItem.name +
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
        let methods = _.cloneDeep(this.methods)

        this.dlgLoading = true

        if (this.editedIndex > -1) {
          await this.$vault.auth.updateMethod(
            this.editedItem,
            this.$store.state.vtok
          )
        } else {
          await this.$vault.auth.createMethod(
            this.editedItem,
            this.$store.state.vtok
          )
        }

        if (this.editedIndex > -1) {
          Object.assign(methods[this.editedIndex], this.editedItem)
        } else {
          methods.push(this.editedItem)
        }

        this.$store.dispatch("updateListAuthMethods", methods)
        this.showMsg({
          message:
            "The method " + this.editedItem.name + " has been saved correctly !"
        })

        this.closeDlgItem()
      } catch (error) {
        this.closeDlgItem()
        this.showMsg({ type: "error", message: error })
      }
    },
    openDlgItem: function(item, op) {
      this.editedIndex = this.methods.indexOf(item)
      this.editedItem = Object.assign({}, item)
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
