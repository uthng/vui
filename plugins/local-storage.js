import createPersistedState from "vuex-persistedstate"
import * as Cookies from "js-cookie"

export default ({ store }) => {
  createPersistedState({
    key: "iui",
    paths: ["vtok", "user"],
    storage: {
      getItem: key => Cookies.get(key),
      // Please see https://github.com/js-cookie/js-cookie#json, on how to handle JSON.
      setItem: (key, value) =>
        Cookies.set(key, value, { expires: 1 / 96, secure: false }),
      // setItem: (key, value) => Cookies.set(key, value),
      removeItem: key => Cookies.remove(key)
    }
  })(store)
}
