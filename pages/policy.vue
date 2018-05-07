<template>
  <div>
    <v-dialog v-model="dlgEditPolicy" persistent max-width="700px">
      <v-btn slot="activator" color="primary" class="mb-2" dark>New Policy</v-btn>
      <v-card>
        <v-card-title>
          <span class="headline">{{ formTitle }}</span>
        </v-card-title>
        <v-card-text>
          <v-container fluid class="px-3">
            <v-layout row wrap>
              <v-flex xs12>
                <v-text-field
                  v-model="editedPolicy.name"
                  :disabled="formFieldNameEnabled"
                  :rules="[(value) => (value.match(/^[a-zA-Z0-9][a-zA-Z0-9_-]+[a-zA-Z0-9]$/) !== null) || 'The secret path must contain only: [a-zA-Z0-9_-] and must not be started or ended by _ or -']"
                  name="policy-name"
                  label="Name:"
                  required
                />
              </v-flex>
              <v-flex xs12>
                <v-text-field
                  v-model="editedPolicy.rules"
                  name="policy-rules"
                  label="Rules:"
                  multi-line
                  required
                />
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click.stop="closeDlgPolicy()">Close</v-btn>
          <v-btn color="primary" @click.stop="savePolicy()">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dlgDeletePolicy" persistent max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Delete Policy</span>
        </v-card-title>
        <v-card-text>
          Are you sure to delete the following policy: <b><span class="red--text text--lighten-2">{{ editedPolicy.name }}</span></b> ?
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" flat @click.stop="closeDlgPolicy()">Close</v-btn>
          <v-btn color="primary" flat @click.stop="deletePolicy()">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-data-table
      :headers="headers"
      :items="policies"
      hide-actions
      class="elevation-1 body-1"
      item-key="name"
    >
      <template slot="items" slot-scope="props">
        <tr @click="props.expanded = !props.expanded">
          <td class="text-xs-left body-1">{{ props.item.name }}</td>
          <td class="justify-center layout px-0">
            <v-btn icon class="mx-0" @click="openDlgPolicy(props.item, 'edit')">
              <v-icon color="teal">edit</v-icon>
            </v-btn>
            <v-btn icon class="mx-0" @click="openDlgPolicy(props.item, 'delete')">
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
          <v-card-text class="line-break-and-tab body-1">{{ props.item.rules }}</v-card-text>
        </v-card>
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
        { text: "Name", value: "name", align: "left" },
        { text: "Actions", value: "actions", sortable: false, align: "left" }
      ],
      dlgLoading: false,
      dlgEditPolicy: false,
      dlgDeletePolicy: false,
      editedIndex: -1,
      editedPolicy: { name: "", rules: "" },
      defaultPolicy: { name: "", rules: "" }
    }
  },
  computed: {
    policies: function() {
      return this.$store.state.listPolicies
    },
    formTitle: function() {
      return this.editedIndex === -1 ? "New Policy" : "Edit Policy"
    },
    formFieldNameEnabled: function() {
      return this.editedIndex === -1 ? false : true
    }
  },
  mounted: async function() {
    try {
      this.dlgLoading = true
      let policies = await this.$vault.policy.getPolicies(
        this.$store.state.vtok
      )

      this.$store.dispatch("updateListPolicies", policies)
      this.dlgLoading = false
    } catch (err) {
      this.dlgLoading = false
      this.showMsg({ type: "error", message: err })
    }
  },
  methods: {
    deletePolicy: async function() {
      try {
        let policies = _.cloneDeep(this.policies)

        this.dlgLoading = true
        await this.$vault.policy.deletePolicy(
          this.editedPolicy.name,
          this.$store.state.vtok
        )

        policies.splice(this.editedIndex, 1)

        this.$store.dispatch("updateListPolicies", policies)
        this.showMsg({
          message:
            "The policy " +
            this.editedPolicy.name +
            " has been deleted correctly !"
        })

        this.closeDlgPolicy()
      } catch (error) {
        this.closeDlgPolicy()
        this.showMsg({ type: "error", message: error })
      }
    },
    savePolicy: async function() {
      try {
        let policies = _.cloneDeep(this.policies)

        this.dlgLoading = true
        await this.$vault.policy.updatePolicy(
          this.editedPolicy,
          this.$store.state.vtok
        )

        if (this.editedIndex > -1) {
          Object.assign(policies[this.editedIndex], this.editedPolicy)
        } else {
          policies.push(this.editedPolicy)
        }

        this.$store.dispatch("updateListPolicies", policies)
        this.showMsg({
          message:
            "The policy " +
            this.editedPolicy.name +
            " has been saved correctly !"
        })

        this.closeDlgPolicy()
      } catch (error) {
        this.closeDlgPolicy()
        this.showMsg({ type: "error", message: error })
      }
    },
    openDlgPolicy: function(item, op) {
      this.editedIndex = this.policies.indexOf(item)
      this.editedPolicy = Object.assign({}, item)
      if (op === "edit") {
        this.dlgEditPolicy = true
      } else {
        this.dlgDeletePolicy = true
      }
    },
    closeDlgPolicy: function() {
      this.dlgLoading = false
      this.dlgEditPolicy = false
      this.dlgDeletePolicy = false

      this.editedIndex = -1
      this.editedPolicy = Object.assign({}, this.defaultPolicy)
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
