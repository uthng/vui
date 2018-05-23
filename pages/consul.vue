<template>
  <v-container fluid grid-list-xl>
    <v-layout row justify-center align-center>
      <v-flex xs12>
        <v-select
          v-model="selectedConsul"
          :items="listConsuls"
          label="CONSUL Paths:"
          required
          @input="loadData"
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
          <v-tab>Roles</v-tab>
          <v-tab>Settings</v-tab>
          <v-tab-item>
            <v-dialog v-model="dlgEditRole" persistent max-width="700px">
              <v-btn slot="activator" color="primary" class="mb-2" dark>New Role</v-btn>
              <v-card>
                <v-card-title>
                  <span class="headline">{{ formRoleTitle }}</span>
                </v-card-title>
                <v-card-text>
                  <v-container grid-list-md class="px-3">
                    <v-layout row wrap>
                      <v-flex xs12>
                        <v-text-field
                          v-model="editedRole.name"
                          :rules="[(value) => (value.match(/^[a-zA-Z0-9][a-zA-Z0-9_-]+[a-zA-Z0-9]$/) !== null) || 'Name must contain only: [a-zA-Z0-9_-] and must not be started or ended by - or  _']"
                          :disabled="formRoleFieldEnabled"
                          name="role-name"
                          label="Name:"
                          required
                        />
                      </v-flex>
                      <v-flex xs12>
                        <v-select
                          :items="aclTypes"
                          v-model="editedRole.token_type"
                          name="role-tokentype"
                          label="Token Type:"
                          required
                        />
                      </v-flex>
                      <v-flex xs12>
                        <v-text-field
                          v-model="editedRole.policy"
                          name="role-policy"
                          label="Policy:"
                          multi-line
                          required
                        />
                      </v-flex>
                      <v-flex xs6>
                        <v-text-field
                          v-model="editedRole.lease"
                          name="role-lease"
                          label="Lease:"
                        />
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-btn color="primary" @click.stop="closeDlgRole()">Close</v-btn>
                  <v-btn color="primary" @click.stop="saveRole()">Save</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog v-model="dlgDeleteRole" persistent max-width="500px">
              <v-card>
                <v-card-title>
                  <span class="headline">Delete Role</span>
                </v-card-title>
                <v-card-text>
                  Are you sure to delete the following role: <b><span class="red--text text--lighten-2">{{ editedRole.name }}</span></b> ?
                </v-card-text>
                <v-card-actions>
                  <v-btn color="primary" flat @click.stop="closeDlgRole()">Close</v-btn>
                  <v-btn color="primary" flat @click.stop="deleteRole()">Delete</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <v-dialog v-model="dlgGenerateToken" persistent max-width="500px">
              <v-card>
                <v-card-title>
                  <span class="headline">Generate Token</span>
                </v-card-title>
                <v-card-text>
                  The token corresponding to the role: <b><span class="red--text text--lighten-2">{{ editedRole.name }}</span></b> has been successfully generated: <b><span class="red--text text--lighten-2">{{ generatedToken }}</span></b> !
                </v-card-text>
                <v-card-actions>
                  <v-btn color="primary" flat @click.stop="closeDlgToken">Close</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <v-data-table
              :headers="roleHeaders"
              :items="roles"
              hide-actions
              class="elevation-1 body-1"
              item-key="name"
            >
              <template slot="items" slot-scope="props">
                <tr style="vertical-align: top" @click="props.expanded = !props.expanded">
                  <td class="text-xs-left body-1 py-2">{{ props.item.name }}</td>
                  <td class="text-xs-left body-1 py-2">{{ props.item.token_type }}</td>
                  <td class="text-xs-left body-1 py-2">{{ props.item.lease }}</td>
                  <td class="justify-center layout px-0">
                    <v-btn icon class="mx-0" @click="openDlgRole(props.item, 'edit')">
                      <v-icon color="teal">edit</v-icon>
                    </v-btn>
                    <v-btn icon class="mx-0" @click="openDlgToken(props.item)">
                      <v-icon color="teal">vpn_key</v-icon>
                    </v-btn>
                    <v-btn icon class="mx-0" @click="openDlgRole(props.item, 'delete')">
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
              <template slot="expand" slot-scope="props">
                <v-card flat>
                  <v-card-text class="line-break-and-tab body-1">{{ props.item.policy }}</v-card-text>
                </v-card>
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
                        :label="`${formConsulEdit === true ? 'Edit' : 'View' }`"
                        v-model="formConsulEdit"
                      />
                    </v-flex>
                    <v-flex xs12>
                      <v-text-field
                        v-model="consulConfig.address"
                        :disabled="!formConsulEdit"
                        name="consul-address"
                        label="Address:"
                        hint="Specify host:port"
                        required
                      />
                    </v-flex>
                    <v-flex xs12>
                      <v-text-field
                        v-model="consulConfig.scheme"
                        :disabled="!formConsulEdit"
                        name="consul-scheme"
                        label="Scheme:"
                        required
                      />
                    </v-flex>
                    <v-flex xs12>
                      <v-text-field
                        v-model="consulConfig.token"
                        :disabled="!formConsulEdit"
                        name="consul-token"
                        label="Token:"
                        required
                      />
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-btn :disabled="!formConsulEdit" color="primary" @click.stop="cancelConsul()">Cancel</v-btn>
                <v-btn :disabled="!formConsulEdit" color="primary" @click.stop="saveConsul()">Save</v-btn>
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
      roleHeaders: [
        { text: "Name", value: "name", align: "left" },
        { text: "Token Type", value: "token_type", align: "left" },
        { text: "Lease", value: "lease", align: "left" },
        { text: "Actions", value: "actions", sortable: false, align: "left" }
      ],
      dlgEditRole: false,
      dlgDeleteRole: false,
      editedRoleIndex: -1,
      editedRole: {
        name: "",
        token_type: "client",
        lease: "30m",
        policy: ""
      },
      defaultRole: {
        name: "",
        token_type: "client",
        lease: "30m",
        policy: ""
      },
      consulConfig: {
        address: "localhost:8500",
        scheme: "http",
        token: ""
      },
      backupConsulConfig: {},
      aclTypes: ["client", "management"],
      formConsulEdit: false,
      listConsuls: [],
      selectedConsul: "",
      dlgGenerateToken: false,
      generatedToken: ""
    }
  },
  computed: {
    roles: function() {
      return this.$store.state.consulListRoles
    },
    formRoleTitle: function() {
      return this.editedRoleIndex === -1 ? "New Role" : "Edit Role"
    },
    formRoleFieldEnabled: function() {
      return this.editedRoleIndex === -1 ? false : true
    }
  },
  mounted: async function() {
    try {
      this.dlgLoading = true

      // Get all LDAP mounted methods
      let engines = await this.$vault.secret.getEngines(this.$store.state.vtok)
      this.listConsuls = engines
        .filter(engine => {
          return engine.type === "consul"
        })
        .map(consul => {
          return consul.path
        })

      this.selectedConsul = this.listConsuls[0]

      await this.loadData()

      this.dlgLoading = false
    } catch (err) {
      console.log(err)
      this.dlgLoading = false
      this.showMsg({ type: "error", message: err })
    }
  },
  methods: {
    loadData: async function() {
      this.dlgLoading = true
      let roles = []
      roles = await this.$vault.consul.getRoles(
        this.selectedConsul,
        this.$store.state.vtok
      )

      this.consulConfig = await this.$vault.consul.getConfig(
        this.selectedConsul,
        this.$store.state.vtok
      )
      this.backupConsulConfig = Object.assign({}, this.consulConfig)

      this.$store.dispatch("updateConsulListRoles", roles)
      this.dlgLoading = false
    },
    deleteRole: async function() {
      try {
        let roles = _.cloneDeep(this.roles)

        this.dlgLoading = true
        await this.$vault.consul.deleteRole(
          this.selectedConsul,
          this.editedRole.name,
          this.$store.state.vtok
        )

        roles.splice(this.editedRoleIndex, 1)

        this.$store.dispatch("updateConsulListRoles", roles)
        this.showMsg({
          message:
            "The role " + this.editedRole.name + " has been deleted correctly !"
        })

        this.closeDlgRole()
      } catch (error) {
        this.closeDlgRole()
        this.showMsg({ type: "error", message: error })
      }
    },
    saveRole: async function() {
      try {
        let roles = _.cloneDeep(this.roles)
        let clonedRole = _.cloneDeep(this.editedRole)

        this.dlgLoading = true

        await this.$vault.consul.updateRole(
          this.selectedConsul,
          clonedRole,
          this.$store.state.vtok
        )

        if (this.editedRoleIndex > -1) {
          Object.assign(roles[this.editedRoleIndex], this.editedRole)
        } else {
          roles.push(this.editedRole)
        }

        this.$store.dispatch("updateConsulListRoles", roles)
        this.showMsg({
          message:
            "The role " + this.editedRole.name + " has been saved correctly !"
        })

        this.closeDlgRole()
      } catch (error) {
        this.closeDlgRole()
        this.showMsg({ type: "error", message: error })
      }
    },
    openDlgRole: function(item, op) {
      this.editedRoleIndex = this.roles.indexOf(item)
      this.editedRole = Object.assign({}, item)
      if (op === "edit") {
        this.dlgEditRole = true
      } else {
        this.dlgDeleteRole = true
      }
    },
    closeDlgRole: function() {
      this.dlgLoading = false
      this.dlgEditRole = false
      this.dlgDeleteRole = false

      this.editedRoleIndex = -1
      this.editedRole = Object.assign({}, this.defaultRole)
    },
    cancelConsul: function() {
      this.consulConfig = Object.assign({}, this.backupConsulConfig)
      this.formConsulEdit = false
    },
    saveConsul: async function() {
      try {
        await this.$vault.consul.updateConfig(
          this.selectedConsul,
          this.consulConfig,
          this.$store.state.vtok
        )

        this.backupConsulConfig = Object.assign({}, this.consulConfig)
        this.showMsg({
          message: "The consul config has been updated successfully !"
        })
        this.formConsulEdit = false
      } catch (error) {
        this.cancelConsul()
        this.showMsg({ type: "error", message: error })
      }
    },
    openDlgToken: function(item) {
      this.dlgLoading = true
      this.$vault.consul
        .generateToken(this.selectedConsul, item.name, this.$store.state.vtok)
        .then(response => {
          this.generatedToken = response.data.token

          this.editedRoleIndex = this.roles.indexOf(item)
          this.editedRole = Object.assign({}, item)
          this.dlgGenerateToken = true
          this.dlgLoading = false
        })
        .catch(error => {
          this.closeDlgToken()
          this.showMsg({ type: "error", message: error })
        })
    },
    closeDlgToken: function() {
      this.dlgLoading = false
      this.dlgGenerateToken = false

      this.editedRoleIndex = -1
      this.editedRole = Object.assign({}, this.defaultRole)
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
