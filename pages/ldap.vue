<template>
  <v-container fluid grid-list-xl>
    <v-layout row justify-center align-center>
      <v-flex xs12>
        <v-select
          v-model="selectedLdap"
          :items="listLdaps"
          label="LDAP Paths:"
          required
          @change="loadData"
        />
      </v-flex>
    </v-layout>
    <v-layout row justify-center align-center>
      <v-flex xs12>
        <v-tabs
          slot="extension"
          color="blue darken-3"
        >
          <v-tabs-slider color="grey lighten-1"/>
          <v-tab>Groups</v-tab>
          <v-tab>Users</v-tab>
          <v-tab>Settings</v-tab>
          <v-tab-item>
            <v-dialog v-model="dlgEditGroup" persistent max-width="700px">
              <v-btn slot="activator" color="primary" class="mb-2" dark>New Group</v-btn>
              <v-card>
                <v-card-title>
                  <span class="headline">{{ formGroupTitle }}</span>
                </v-card-title>
                <v-card-text>
                  <v-container grid-list-md class="px-3">
                    <v-layout row wrap>
                      <v-flex xs12>
                        <v-text-field
                          v-model="editedGroup.name"
                          :rules="[(value) => (value.match(/^[a-zA-Z0-9][a-zA-Z0-9_-]+[a-zA-Z0-9]$/) !== null) || 'Name must contain only: [a-zA-Z0-9_-] and must not be started or ended by - or  _']"
                          :disabled="formGroupFieldEnabled"
                          name="group-name"
                          label="Name:"
                          required
                        />
                      </v-flex>
                      <v-flex xs12>
                        <v-select
                          v-model="editedGroup.policies"
                          :items="policies"
                          name="group-policies"
                          label="Policies:"
                          item-text="name"
                          item-value="name"
                          multiple
                          required
                        />
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-btn color="primary" @click.stop="closeDlgGroup()">Close</v-btn>
                  <v-btn color="primary" @click.stop="saveGroup()">Save</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog v-model="dlgDeleteGroup" persistent max-width="500px">
              <v-card>
                <v-card-title>
                  <span class="headline">Delete Group</span>
                </v-card-title>
                <v-card-text>
                  Are you sure to delete the following group: <b><span class="red--text text--lighten-2">{{ editedGroup.name }}</span></b> ?
                </v-card-text>
                <v-card-actions>
                  <v-btn color="primary" flat @click.stop="closeDlgGroup()">Close</v-btn>
                  <v-btn color="primary" flat @click.stop="deleteGroup()">Delete</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <v-data-table
              :headers="groupHeaders"
              :items="groups"
              hide-actions
              class="elevation-1 body-1"
              item-key="name"
            >
              <template slot="items" slot-scope="props">
                <tr style="vertical-align: top">
                  <td class="text-xs-left body-1 py-2">{{ props.item.name }}</td>
                  <td class="text-xs-left body-1">
                    <div v-for="policy in props.item.policies" :key="policy" class="my-2">
                      <span class="body-1">{{ policy }}</span>
                    </div>
                  </td>
                  <td class="justify-center layout px-0">
                    <v-btn icon class="mx-0" @click="openDlgGroup(props.item, 'edit')">
                      <v-icon color="teal">edit</v-icon>
                    </v-btn>
                    <v-btn icon class="mx-0" @click="openDlgGroup(props.item, 'delete')">
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
          </v-tab-item>

          <v-tab-item>
            <v-dialog v-model="dlgEditUser" persistent max-width="700px">
              <v-btn slot="activator" color="primary" class="mb-2" dark>New User</v-btn>
              <v-card>
                <v-card-title>
                  <span class="headline">{{ formUserTitle }}</span>
                </v-card-title>
                <v-card-text>
                  <v-container grid-list-md class="px-3">
                    <v-layout row wrap>
                      <v-flex xs12>
                        <v-text-field
                          v-model="editedUser.username"
                          :rules="[(value) => (value.match(/^[a-zA-Z0-9][a-zA-Z0-9_-]+[a-zA-Z0-9]$/) !== null) || 'Username must contain only: [a-zA-Z0-9_-] and must not be started or ended by - or  _']"
                          :disabled="formUserFieldEnabled"
                          name="user-username"
                          label="Username:"
                          required
                        />
                      </v-flex>
                      <v-flex xs12>
                        <v-select
                          v-model="editedUser.groups"
                          :items="groups"
                          name="user-policies"
                          label="Groups:"
                          item-text="name"
                          item-value="name"
                          multiple
                        />
                      </v-flex>
                      <v-flex xs12>
                        <v-select
                          v-model="editedUser.policies"
                          :items="policies"
                          name="user-policies"
                          item-text="name"
                          item-value="name"
                          label="Policies:"
                          multiple
                        />
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-btn color="primary" @click.stop="closeDlgUser()">Close</v-btn>
                  <v-btn color="primary" @click.stop="saveUser()">Save</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog v-model="dlgDeleteUser" persistent max-width="500px">
              <v-card>
                <v-card-title>
                  <span class="headline">Delete User</span>
                </v-card-title>
                <v-card-text>
                  Are you sure to delete the following user: <b><span class="red--text text--lighten-2">{{ editedUser.username }}</span></b> ?
                </v-card-text>
                <v-card-actions>
                  <v-btn color="primary" flat @click.stop="closeDlgUser()">Close</v-btn>
                  <v-btn color="primary" flat @click.stop="deleteUser()">Delete</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <v-data-table
              :headers="userHeaders"
              :items="users"
              hide-actions
              class="elevation-1 body-1"
              item-key="username"
            >
              <template slot="items" slot-scope="props">
                <tr style="vertical-align: top">
                  <td class="text-xs-left body-1 py-2">{{ props.item.username }}</td>
                  <td class="text-xs-left body-1">
                    <div v-for="group in props.item.groups" :key="group" class="my-2">
                      <span class="body-1">{{ group }}</span>
                    </div>
                  </td>
                  <td class="text-xs-left body-1">
                    <div v-for="policy in props.item.policies" :key="policy" class="my-2">
                      <span class="body-1">{{ policy }}</span>
                    </div>
                  </td>
                  <td class="justify-center layout px-0">
                    <v-btn icon class="mx-0" @click="openDlgUser(props.item, 'edit')">
                      <v-icon color="teal">edit</v-icon>
                    </v-btn>
                    <v-btn icon class="mx-0" @click="openDlgUser(props.item, 'delete')">
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
          </v-tab-item>

          <v-tab-item>
            <v-card>
              <v-card-text>
                <v-container grid-list-md class="px-3">
                  <v-layout row wrap>
                    <v-flex xs12>
                      <v-switch
                        :label="`${formLdapEdit === true ? 'Edit' : 'View' }`"
                        v-model="formLdapEdit"
                      />
                    </v-flex>
                    <v-flex xs12>
                      <v-text-field
                        v-model="ldapConfig.url"
                        :disabled="!formLdapEdit"
                        name="ldap-url"
                        label="Url:"
                        required
                      />
                    </v-flex>
                    <v-flex xs12>
                      <v-checkbox
                        v-model="ldapConfig.starttls"
                        :disabled="!formLdapEdit"
                        label="Issues a StartTLS command after establishing an unencrypted connection"
                      />
                    </v-flex>
                    <v-flex xs12>
                      <v-checkbox
                        v-model="ldapConfig.case_sensitive_names"
                        :disabled="!formLdapEdit"
                        label="User and group names assigned to policies will be case sensitive"
                      />
                    </v-flex>
                    <v-flex xs12>
                      <v-checkbox
                        v-model="ldapConfig.insecure_tls"
                        :disabled="!formLdapEdit"
                        label="Skips LDAP server SSL certificate verification"
                      />
                    </v-flex>
                    <v-flex xs12>
                      <v-checkbox
                        v-model="ldapConfig.discoverdn"
                        :disabled="!formLdapEdit"
                        label="Use anonymous bind to discover the bind DN of a use"
                      />
                    </v-flex>
                    <v-flex xs12>
                      <v-checkbox
                        v-model="ldapConfig.deny_null_bind"
                        :disabled="!formLdapEdit"
                        label="Prevents users from bypassing authentication when providing an empty password"
                      />
                    </v-flex>
                    <v-flex xs12>
                      <v-select
                        v-model="ldapConfig.tls_min_version"
                        :items="listTls"
                        :disabled="!formLdapEdit"
                        name="ldap-tls_min_version"
                        label="Minimum TLS version:"
                      />
                    </v-flex>
                    <v-flex xs12>
                      <v-select
                        v-model="ldapConfig.tls_max_version"
                        :items="listTls"
                        :disabled="!formLdapEdit"
                        name="ldap-tls_max_version"
                        label="Maximum TLS version:"
                      />
                    </v-flex>
                    <v-flex xs12>
                      <v-text-field
                        v-model="ldapConfig.certificate"
                        :disabled="!formLdapEdit"
                        name="ldap-certificate"
                        label="CA Certificate:"
                        multi-line
                      />
                    </v-flex>
                    <v-flex xs12>
                      <v-text-field
                        v-model="ldapConfig.binddn"
                        :disabled="!formLdapEdit"
                        name="ldap-binddn"
                        label="Bind DN:"
                        multi-line
                      />
                    </v-flex>
                    <v-flex xs12>
                      <v-text-field
                        v-model="ldapConfig.bindpass"
                        :append-icon="formLdapVisibleBindPass ? 'visibility' : 'visibility_off'"
                        :append-icon-cb="() => (formLdapVisibleBindPass = !formLdapVisibleBindPass)"
                        :type="formLdapVisibleBindPass ? 'password' : 'text'"
                        :disabled="!formLdapEdit"
                        name="ldap-bindpass"
                        label="Bind pass:"
                      />
                    </v-flex>
                    <v-flex xs12>
                      <v-text-field
                        v-model="ldapConfig.userdn"
                        :disabled="!formLdapEdit"
                        name="ldap-userdn"
                        label="User DN:"
                        multi-line
                      />
                    </v-flex>
                    <v-flex xs12>
                      <v-text-field
                        v-model="ldapConfig.userattr"
                        :disabled="!formLdapEdit"
                        name="ldap-userattr"
                        label="User attribute:"
                      />
                    </v-flex>
                    <v-flex xs12>
                      <v-text-field
                        v-model="ldapConfig.upndomain"
                        :disabled="!formLdapEdit"
                        name="ldap-upndomain"
                        label="User Principal (UPN) Domain:"
                      />
                    </v-flex>
                    <v-flex xs12>
                      <v-text-field
                        v-model="ldapConfig.groupfiler"
                        :disabled="!formLdapEdit"
                        name="ldap-groupfilter"
                        label="Group filter:"
                      />
                    </v-flex>
                    <v-flex xs12>
                      <v-text-field
                        v-model="ldapConfig.groupdn"
                        :disabled="!formLdapEdit"
                        name="ldap-groupdn"
                        label="Group DN:"
                        multi-line
                      />
                    </v-flex>
                    <v-flex xs12>
                      <v-text-field
                        v-model="ldapConfig.groupattr"
                        :disabled="!formLdapEdit"
                        name="ldap-groupattr"
                        label="Group attribute:"
                      />
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-btn :disabled="!formLdapEdit" color="primary" @click.stop="cancelLdap()">Cancel</v-btn>
                <v-btn :disabled="!formLdapEdit" color="primary" @click.stop="saveLdap()">Save</v-btn>
              </v-card-actions>
            </v-card>
          </v-tab-item>
        </v-tabs>
      </v-flex>
      <loader v-model="dlgLoading"/>
    </v-layout>
  </v-container>
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
      dlgLoading: false,
      groupHeaders: [
        { text: "Name", value: "name", align: "left" },
        { text: "Policies", value: "policies", align: "left" },
        { text: "Actions", value: "actions", sortable: false, align: "left" }
      ],
      dlgEditGroup: false,
      dlgDeleteGroup: false,
      editedGroupIndex: -1,
      editedGroup: {
        name: "",
        policies: []
      },
      defaultGroup: {
        name: "",
        policies: []
      },
      userHeaders: [
        { text: "Username", value: "username", align: "left" },
        { text: "Groups", value: "groups", align: "left" },
        { text: "Policies", value: "policies", align: "left" },
        { text: "Actions", value: "actions", sortable: false, align: "left" }
      ],
      dlgEditUser: false,
      dlgDeleteUser: false,
      editedUserIndex: -1,
      editedUser: {
        username: "",
        groups: [],
        policies: []
      },
      defaultUser: {
        username: "",
        groups: [],
        policies: []
      },
      policies: [],
      ldapConfig: {
        url: "",
        case_sensitive_names: false,
        starttls: false,
        tls_min_version: "tls12",
        tls_max_version: "tls12",
        insecure_tls: false,
        certificate: "",
        binddn: "",
        bindpass: "",
        userdn: "",
        userattr: "",
        discoverdn: false,
        deny_null_bind: true,
        upndomain: "",
        groupfilter: "",
        groupdn: "",
        groupattr: ""
      },
      backupLdapConfig: {},
      listTls: ["tls12", "tls11", "tls10"],
      formLdapEdit: false,
      formLdapVisibleBindPass: true,
      listLdaps: [],
      selectedLdap: ""
    }
  },
  computed: {
    groups: function() {
      return this.$store.state.ldapListGroups
    },
    formGroupTitle: function() {
      return this.editedGroupIndex === -1 ? "New Group" : "Edit Group"
    },
    formGroupFieldEnabled: function() {
      return this.editedGroupIndex === -1 ? false : true
    },
    users: function() {
      return this.$store.state.ldapListUsers
    },
    formUserTitle: function() {
      return this.editedUserIndex === -1 ? "New User" : "Edit User"
    },
    formUserFieldEnabled: function() {
      return this.editedUserIndex === -1 ? false : true
    }
  },
  mounted: async function() {
    try {
      this.dlgLoading = true

      // Listen event to list/get secret kv path
      this.$root.$on("change", data => {
        console.log("select changed " + data)
      })

      // Get all LDAP mounted methods
      let methods = await this.$vault.auth.getMethods(this.$store.state.vtok)
      this.listLdaps = methods
        .filter(method => {
          return method.type === "ldap"
        })
        .map(ldap => {
          return ldap.path
        })
      this.selectedLdap = this.listLdaps[0]

      await this.loadData()

      this.dlgLoading = false
    } catch (err) {
      this.dlgLoading = false
      this.showMsg({ type: "error", message: err })
    }
  },
  methods: {
    loadData: async function() {
      let groups = await this.$vault.ldap.getGroups(
        this.selectedLdap,
        this.$store.state.vtok
      )
      let users = await this.$vault.ldap.getUsers(
        this.selectedLdap,
        this.$store.state.vtok
      )

      this.policies = await this.$vault.policy.getPolicies(
        this.$store.state.vtok
      )

      this.ldapConfig = await this.$vault.ldap.getConfig(
        this.selectedLdap,
        this.$store.state.vtok
      )
      this.backupLdapConfig = Object.assign({}, this.ldapConfig)

      this.$store.dispatch("updateLdapListGroups", groups)
      this.$store.dispatch("updateLdapListUsers", users)
    },
    deleteGroup: async function() {
      try {
        let groups = _.cloneDeep(this.groups)

        this.dlgLoading = true
        await this.$vault.ldap.deleteGroup(
          this.selectedLdap,
          this.editedGroup.name,
          this.$store.state.vtok
        )

        groups.splice(this.editedGroupIndex, 1)

        this.$store.dispatch("updateLdapListGroups", groups)
        this.showMsg({
          message:
            "The group " +
            this.editedGroup.name +
            " has been deleted correctly !"
        })

        this.closeDlgGroup()
      } catch (error) {
        this.closeDlgGroup()
        this.showMsg({ type: "error", message: error })
      }
    },
    saveGroup: async function() {
      try {
        let groups = _.cloneDeep(this.groups)

        this.dlgLoading = true

        await this.$vault.ldap.updateGroup(
          this.selectedLdap,
          this.editedGroup,
          this.$store.state.vtok
        )

        if (this.editedGroupIndex > -1) {
          Object.assign(groups[this.editedGroupIndex], this.editedGroup)
        } else {
          groups.push(this.editedGroup)
        }

        this.$store.dispatch("updateLdapListGroups", groups)
        this.showMsg({
          message:
            "The group " + this.editedGroup.name + " has been saved correctly !"
        })

        this.closeDlgGroup()
      } catch (error) {
        this.closeDlgGroup()
        this.showMsg({ type: "error", message: error })
      }
    },
    openDlgGroup: function(item, op) {
      this.editedGroupIndex = this.groups.indexOf(item)
      this.editedGroup = Object.assign({}, item)
      if (op === "edit") {
        this.dlgEditGroup = true
      } else {
        this.dlgDeleteGroup = true
      }
    },
    closeDlgGroup: function() {
      this.dlgLoading = false
      this.dlgEditGroup = false
      this.dlgDeleteGroup = false

      this.editedGroupIndex = -1
      this.editedGroup = Object.assign({}, this.defaultGroup)
    },
    deleteUser: async function() {
      try {
        let users = _.cloneDeep(this.users)

        this.dlgLoading = true
        await this.$vault.ldap.deleteUser(
          this.selectedLdap,
          this.editedUser.username,
          this.$store.state.vtok
        )

        users.splice(this.editedUserIndex, 1)

        this.$store.dispatch("updateLdapListUsers", users)
        this.showMsg({
          message:
            "The user " +
            this.editedUser.username +
            " has been deleted correctly !"
        })

        this.closeDlgUser()
      } catch (error) {
        this.closeDlgUser()
        this.showMsg({ type: "error", message: error })
      }
    },
    saveUser: async function() {
      try {
        let users = _.cloneDeep(this.users)

        this.dlgLoading = true

        await this.$vault.ldap.updateUser(
          this.selectedLdap,
          this.editedUser,
          this.$store.state.vtok
        )

        if (this.editedUserIndex > -1) {
          Object.assign(users[this.editedUserIndex], this.editedUser)
        } else {
          users.push(this.editedUser)
        }

        this.$store.dispatch("updateLdapListUsers", users)
        this.showMsg({
          message:
            "The user " +
            this.editedUser.username +
            " has been saved correctly !"
        })

        this.closeDlgUser()
      } catch (error) {
        this.closeDlgUser()
        this.showMsg({ type: "error", message: error })
      }
    },
    openDlgUser: function(item, op) {
      this.editedUserIndex = this.users.indexOf(item)
      this.editedUser = Object.assign({}, item)
      if (op === "edit") {
        this.dlgEditUser = true
      } else {
        this.dlgDeleteUser = true
      }
    },
    closeDlgUser: function() {
      this.dlgLoading = false
      this.dlgEditUser = false
      this.dlgDeleteUser = false

      this.editedUserIndex = -1
      this.editedUser = Object.assign({}, this.defaultUser)
    },
    cancelLdap: function() {
      this.ldapConfig = Object.assign({}, this.backupLdapConfig)
      this.formLdapEdit = false
    },
    saveLdap: async function() {
      try {
        await this.$vault.ldap.updateConfig(
          this.selectedLdap,
          this.ldapConfig,
          this.$store.state.vtok
        )

        this.backupLdapConfig = Object.assign({}, this.ldapConfig)
        this.showMsg({
          message: "The ldap config has been updated successfully !"
        })
        this.formLdapEdit = false
      } catch (error) {
        this.cancelLdap()
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
<style>
</style>
