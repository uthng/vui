export default function({ store, route, redirect }) {
  // console.log('vtok ' + store.state.vtok)
  if (store.state.vtok === "") {
    redirect("/login")
  } else {
    // Check if vtok is already set and user tries to access to /user-login
    // then redirect him to /
    const isUrlLogin = /^\/login(\/|$)/.test(route.fullPath)
    if (isUrlLogin) {
      redirect("/")
    }
  }
}
