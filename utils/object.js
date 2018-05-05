// mapping a path to a map with the value for the end of each path
// function using recursion
export default {
  createObjectByPath: function(map, sep = ".", path, value) {
    // var localmap = map
    // var localpath = path.split('.')

    // while (localpath.length > 1) {
    // map = map[localpath[0]] = localmap[localpath.shift()] || {}
    // }
    // map[localpath.shift()] = value
    var lmap = map
    var lpath = path.split(sep)
    for (var i = 0, numPath = lpath.length - 1; i < numPath; ++i) {
      if (!(lpath[i] in lmap)) {
        lmap[lpath[i]] = {}
      }
      lmap = lmap[lpath[i]]
    }

    if (value !== undefined && value !== null) {
      lmap[lpath[i]] = value
    }

    map = lmap
  },

  // This function get an object value from its given path.
  // the path must not be ended by '/'
  getObjectValueByPath: function(obj, sep = ".", path) {
    var a = path.split(sep)
    var context = obj
    var myregexp = /([a-zA-Z]+)(\[(\d)\])+/ // matches:  item[0]
    var match = null

    for (var i = 0; i < a.length - 1; i += 1) {
      match = myregexp.exec(a[i])
      if (match !== null) context = context[match[1]][match[3]]
      else context = context[a[i]]
    }

    // check for ending item[xx] syntax
    match = myregexp.exec([a[a.length - 1]])

    if (match !== null) return context[match[1]][match[3]]
    else return context[a[a.length - 1]]
  },

  // This function likes createObjectByPath but handles array
  // path like: name.name.item[0].name
  // where arrary reference is: item[0]
  setObjectValueByPath: function(obj, sep = ".", path, value) {
    var a = path.split(sep)
    var context = obj
    var myregexp = /([a-zA-Z]+)(\[(\d)\])+/ // matches:  item[0]
    var match = null

    for (var i = 0; i < a.length - 1; i += 1) {
      match = myregexp.exec(a[i])
      if (match !== null) context = context[match[1]][match[3]]
      else context = context[a[i]]
    }

    // check for ending item[xx] syntax
    match = myregexp.exec([a[a.length - 1]])

    if (match !== null) context[match[1]][match[3]] = value
    else context[a[a.length - 1]] = value
  },

  // Remove a object by path
  removeObjectByPath: function(obj, sep = ".", path) {
    var a = path.split(sep)
    var context = obj
    var myregexp = /([a-zA-Z]+)(\[(\d)\])+/ // matches:  item[0]
    var match = null

    var isArray = a[a.length - 1].match(/^\d+$/)
    var extent = isArray ? a.length - 2 : a.length - 1

    for (var i = 0; i < extent; i += 1) {
      match = myregexp.exec(a[i])
      if (match !== null) context = context[match[1]][match[3]]
      else context = context[a[i]]
    }
    // check for ending item[xx] syntax
    match = myregexp.exec([a[a.length - 1]])
    if (match !== null) {
      context[match[1]] = context[match[1]].filter(function(x, itt) {
        return itt !== match[3]
      })
    } else {
      if (isArray) {
        context[a[a.length - 2]] = context[a[a.length - 2]].filter(function(
          x,
          itt
        ) {
          return itt !== Number(a[a.length - 1])
        })
      } else {
        delete context[a[a.length - 1]]
      }
    }

    return context
  }
}
