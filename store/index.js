import jsCookie from "js-cookie"
import cookie from "cookie"

export const SET_VTOK = "SET_VTOK"
export const SET_VTOK_EXPIRATION = "SET_VTOK_EXPIRATION"
export const SET_USER = "SET_USER"
export const LOGOUT = "LOGOUT"
export const UPDATE_SECRETPATHOBJECT = "UPDATE_SECRETPATHOBJECT"
export const UPDATE_POLICYPATHS = "UPDATE_POLICYPATHS"
export const UPDATE_LISTPOLICIES = "UPDATE_LISTPOLICIES"
export const UPDATE_LISTAUTHMETHODS = "UPDATE_LISTAUTHMETHODS"
export const UPDATE_LISTSECRETENGINES = "UPDATE_LISTSECRETENGINES"
export const UPDATE_LDAPLISTGROUPS = "UPDATE_LDAPLISTGROUPS"
export const UPDATE_LDAPLISTUSERS = "UPDATE_LDAPLISTUSERS"
export const UPDATE_CONSULLISTROLES = "UPDATE_CONSULLISTROLES"
export const UPDATE_USERPASSLISTUSERS = "UPDATE_USERPASSLISTUSERS"

export const state = () => ({
  sidebar: false,
  vtok: "",
  vtok_expiration: 0,
  user: "",
  secretPathObject: {},
  policyPaths: [],
  listPolicies: [],
  listAuthMethods: [],
  listSecretEngines: [],
  ldapListGroups: [],
  ldapListUsers: [],
  consulListRoles: [],
  userpassListUsers: []
})

export const mutations = {
  toggleSidebar(state) {
    state.sidebar = !state.sidebar
  },

  SET_VTOK(state, data) {
    state.vtok = data
  },

  SET_VTOK_EXPIRATION(state, data) {
    state.vtok_expiration = data
  },

  SET_USER(state, data) {
    state.user = data
  },

  UPDATE_SECRETPATHOBJECT(state, data) {
    state.secretPathObject = data
  },

  UPDATE_POLICYPATHS(state, data) {
    state.policyPaths = [...data]
  },

  UPDATE_LISTPOLICIES(state, data) {
    state.listPolicies = [...data]
  },

  UPDATE_LISTAUTHMETHODS(state, data) {
    state.listAuthMethods = [...data]
  },

  UPDATE_LISTSECRETENGINES(state, data) {
    state.listSecretEngines = [...data]
  },

  UPDATE_LDAPLISTGROUPS(state, data) {
    state.ldapListGroups = [...data]
  },

  UPDATE_LDAPLISTUSERS(state, data) {
    state.ldapListUsers = [...data]
  },

  UPDATE_CONSULLISTROLES(state, data) {
    state.consulListRoles = [...data]
  },

  UPDATE_USERPASSLISTUSERS(state, data) {
    state.userpassListUsers = [...data]
  }
}

export const actions = {
  nuxtServerInit({ commit }, context) {
    return new Promise(resolve => {
      // Get back cookie vtok  & user and set them to states
      let cookies = cookie.parse(context.req.headers.cookie || "")
      // console.log('cookie header ' + JSON.stringify(cookies))
      if (cookies.hasOwnProperty("vui_vtok")) {
        commit(SET_VTOK, cookies.vui_vtok)
      }

      if (cookies.hasOwnProperty("vui_vtok_expiration")) {
        commit(SET_VTOK_EXPIRATION, cookies.vui_vtok_expiration)
      }

      if (cookies.hasOwnProperty("vui_user")) {
        commit(SET_USER, cookies.vui_user)
      }

      resolve(true)
    })
  },

  setVtok({ commit }, data) {
    // Set cookie expiration time to 15mins
    var inFifteenMinutes = new Date(new Date().getTime() + 15 * 60 * 1000)
    var ttl = inFifteenMinutes

    if (data.ttl > 0) {
      ttl = new Date(new Date().getTime() + data.ttl * 1000)
    }

    jsCookie.set("vui_vtok", data.token, { expires: ttl, secure: false })
    jsCookie.set("vui_vtok_expiration", ttl.getTime(), {
      expires: ttl,
      secure: false
    })

    commit(SET_VTOK, data.token)
    commit(SET_VTOK_EXPIRATION, ttl.getTime())
  },

  setUser({ commit }, data) {
    var inFifteenMinutes = new Date(new Date().getTime() + 15 * 60 * 1000)
    var ttl = inFifteenMinutes

    if (data.ttl > 0) {
      ttl = new Date(new Date().getTime() + data.ttl * 1000)
    }

    jsCookie.set("vui_user", data.user, { expires: ttl, secure: false })
    commit(SET_USER, data.user)
  },

  logout({ commit }) {
    jsCookie.remove("vui_vtok")
    jsCookie.remove("vui_vtok_expiration")
    jsCookie.remove("vui_user")

    commit(SET_VTOK, "")
    commit(SET_VTOK_EXPIRATION, 0)
    commit(SET_USER, "")
  },

  updateSecretPathObject({ commit }, data) {
    commit(UPDATE_SECRETPATHOBJECT, data)
  },

  updatePolicyPaths({ commit }, data) {
    commit(UPDATE_POLICYPATHS, data)
  },

  updateListPolicies({ commit }, data) {
    commit(UPDATE_LISTPOLICIES, data)
  },

  updateListAuthMethods({ commit }, data) {
    commit(UPDATE_LISTAUTHMETHODS, data)
  },

  updateListSecretEngines({ commit }, data) {
    commit(UPDATE_LISTSECRETENGINES, data)
  },

  updateLdapListGroups({ commit }, data) {
    commit(UPDATE_LDAPLISTGROUPS, data)
  },

  updateLdapListUsers({ commit }, data) {
    commit(UPDATE_LDAPLISTUSERS, data)
  },

  updateConsulListRoles({ commit }, data) {
    commit(UPDATE_CONSULLISTROLES, data)
  },

  updateUserpassListUsers({ commit }, data) {
    commit(UPDATE_USERPASSLISTUSERS, data)
  }
}
