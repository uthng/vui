import jsCookie from "js-cookie"
import cookie from "cookie"

export const SET_VTOK = "SET_VTOK"
export const SET_VTOK_EXPIRATION = "SET_VTOK_EXPIRATION"
export const SET_USER = "SET_USER"
export const LOGOUT = "LOGOUT"
export const UPDATE_SECRETPATHOBJECT = "UPDATE_SECRETPATHOBJECT"
export const UPDATE_POLICYPATHS = "UPDATE_POLICYPATHS"

export const state = () => ({
  sidebar: false,
  vtok: "",
  vtok_expiration: 0,
  user: "",
  secretPathObject: {},
  policyPaths: []
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
  }
}

export const actions = {
  nuxtServerInit({ commit }, context) {
    return new Promise(resolve => {
      // Get back cookie vtok  & user and set them to states
      let cookies = cookie.parse(context.req.headers.cookie || "")
      // console.log('cookie header ' + JSON.stringify(cookies))
      if (cookies.hasOwnProperty("iui_vtok")) {
        commit(SET_VTOK, cookies.iui_vtok)
      }

      if (cookies.hasOwnProperty("iui_vtok_expiration")) {
        commit(SET_VTOK_EXPIRATION, cookies.iui_vtok_expiration)
      }

      if (cookies.hasOwnProperty("iui_user")) {
        commit(SET_USER, cookies.iui_user)
      }

      resolve(true)
    })
  },

  setVtok({ commit }, data) {
    // Set cookie expiration time to 15mins
    var inFifteenMinutes = new Date(new Date().getTime() + 15 * 60 * 1000)

    jsCookie.set("iui_vtok", data, { expires: inFifteenMinutes, secure: false })
    jsCookie.set("iui_vtok_expiration", inFifteenMinutes.getTime(), {
      expires: inFifteenMinutes,
      secure: false
    })

    commit(SET_VTOK, data)
    commit(SET_VTOK_EXPIRATION, inFifteenMinutes.getTime())
  },

  setUser({ commit }, data) {
    jsCookie.set("iui_user", data, { expires: 1 / 96, secure: false })
    commit(SET_USER, data)
  },

  logout({ commit }) {
    jsCookie.remove("iui_vtok")
    jsCookie.remove("iui_user")

    commit(SET_VTOK, "")
    commit(SET_USER, "")
  },

  updateSecretPathObject({ commit }, data) {
    commit(UPDATE_SECRETPATHOBJECT, data)
  },

  updatePolicyPaths({ commit }, data) {
    commit(UPDATE_POLICYPATHS, data)
  }
}
