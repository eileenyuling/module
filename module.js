const path = require('path')
const fs = require('fs')
const vm = require('vm')
function req(filename) {
  // 解析出绝对路径
  filename = Module._resolveFilename(filename)
  // 看是否加载过模块
  let cacheModule = Module._cache(filename)
  if (cacheModule) {
    return cacheModule.exports
  }
  // 创建一个模块
  let module = new Module(filename)
  module.load()
  Module._cache[filename] = module
  return module.exports

}
function Module(id) {
  this.id = id
  this.exports = {}

}
Module._cache = {

}
Module.wrapper = [
  '(function(exports, require, module, __filename, __dirname){',
  '})'
]
Module.prototype.load = function() {
  let extname = path.extname(this.id)
  Module._extensions[extname](this)

}
Module._resolveFilename = function(filename) {
  let absPath = path.resolve(__dirname, filename)
  let isExists = fs.existsSync(absPath)
  if (isExists) {
    return absPath
  }
  let keys = Object.keys(Module._extensions)
  for (let key of keys) {
    let newPath = absPath + key
    if (fs.existsSync(newPath)) {
      return newPath
    }
  }
  throw new Error('Module not exists')
}
Module._extensions = {
  '.js'(module) {
    let content = fs.readFileSync(module.id, 'utf8')
    content = Module.wrapper[0] + content + Module.wrapper[1]
    // 函数字符串变函数
    let fn = vm.runInThisContext(content)
    let dirname = path.dirname(module.id)
    fn.call(module.exports, module.exports, req, module, module.id, dirname)
  },
  '.json'(module) {
    let content = fs.readFileSync(module.id, 'utf8')
    module.exports = JSON.parse(content)
  }
}
var a = req('./a')
console.log(a)
