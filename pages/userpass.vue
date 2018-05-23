<template>
  <v-container fluid grid-list-xl>
    <v-layout row justify-center align-center>
      <v-flex xs12>
        <v-select
          v-model="selectedUserpass"
          :items="listUserpass"
          label="USERPASS Paths:"
          required
          @change="loadData"
        />
      </v-flex>
    </v-layout>
    <v-layout row justify-center align-center>
      <v-flex xs12>
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
                      :rules="[(value) => (value.match(/^[a-zA-Z0-9_-]+$/) !== null) || 'Username must contain only: [a-zA-Z0-9_-]']"
                      :disabled="formUserFieldEnabled"
                      name="user-username"
                      label="Username:"
                      required
                    />
                  </v-flex>
                  <v-flex xs12>
                    <v-text-field
                      v-model="editedUser.password"
                      :rules="[(value) => (value.match(/^[!$*:.?a-zA-Z0-9_-]+$/) !== null) || 'Username must contain only: [a-zA-Z0-9_-!$*:.?]']"
                      name="user-password"
                      label="Password:"
                      required
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
                  <v-flex xs6>
                    <v-text-field
                      v-model="editedUser.ttl"
                      name="user-ttl"
                      label="TTL:"
                    />
                  </v-flex>
                  <v-flex xs6>
                    <v-text-field
                      v-model="editedUser.max_ttl"
                      name="user-maxttl"
                      label="Max TTL:"
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
                <div v-for="policy in props.item.policies" :key="policy" class="my-2">
                  <span class="body-1">{{ policy }}</span>
                </div>
              </td>
              <td class="text-xs-left body-1 py-2">{{ props.item.ttl }}</td>
              <td class="text-xs-left body-1 py-2">{{ props.item.max_ttl }}</td>
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
      userHeaders: [
        { text: "Username", value: "username", align: "left" },
        { text: "Policies", value: "policies", align: "left" },
        { text: "TTL", value: "ttl", align: "left" },
        { text: "Max TTL", value: "max_ttl", align: "left" },
        { text: "Actions", value: "actions", sortable: false, align: "left" }
      ],
      dlgEditUser: false,
      dlgDeleteUser: false,
      editedUserIndex: -1,
      editedUser: {
        username: "",
        password: "",
        policies: [],
        ttl: "30m",
        max_ttl: "30m"
      },
      defaultUser: {
        username: "",
        password: "",
        policies: [],
        ttl: "30m",
        max_ttl: "30m"
      },
      policies: [],
      formUserpassEdit: false,
      formUserpassVisibleBindPass: true,
      listUserpass: [],
      selectedUserpass: ""
    }
  },
  computed: {
    users: function() {
      return this.$store.state.userpassListUsers
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

      // Get all USERPASS mounted methods
      let methods = await this.$vault.auth.getMethods(this.$store.state.vtok)
      this.listUserpass = methods
        .filter(method => {
          return method.type === "userpass"
        })
        .map(userpass => {
          return userpass.path
        })

      if (this.listUserpass.length > 0) {
        this.selectedUserpass = this.listUserpass[0]

        await this.loadData()
      } else {
        this.showMsg({
          type: "error",
          message: "No User & Password auth backend is enabled !"
        })
      }

      this.dlgLoading = false
    } catch (err) {
      this.dlgLoading = false
      this.showMsg({ type: "error", message: err })
    }
  },
  methods: {
    loadData: async function() {
      let users = await this.$vault.userpass.getUsers(
        this.selectedUserpass,
        this.$store.state.vtok
      )

      this.policies = await this.$vault.policy.getPolicies(
        this.$store.state.vtok
      )

      this.$store.dispatch("updateUserpassListUsers", users)
    },
    deleteUser: async function() {
      try {
        let users = _.cloneDeep(this.users)

        this.dlgLoading = true
        await this.$vault.userpass.deleteUser(
          this.selectedUserpass,
          this.editedUser.username,
          this.$store.state.vtok
        )

        users.splice(this.editedUserIndex, 1)

        this.$store.dispatch("updateUserpassListUsers", users)
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

        await this.$vault.userpass.updateUser(
          this.selectedUserpass,
          _.cloneDeep(this.editedUser),
          this.$store.state.vtok
        )

        if (this.editedUserIndex > -1) {
          Object.assign(users[this.editedUserIndex], this.editedUser)
        } else {
          users.push(this.editedUser)
        }

        this.$store.dispatch("updateUserpassListUsers", users)
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
      this.editedUser = Object.assign(this.editedUser, item)
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
