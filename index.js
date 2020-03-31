const generator = require("@babel/generator")
const parser = require("@babel/parser")
const traverse = require("@babel/traverse")
const types = require("@babel/types")

function compile(code) {
  // 1.parse 将代码解析为抽象语法树（AST）
  const ast = parser.parse(code)
  // 2,traverse 转换代码
  const visitor = {
    enter(path) {
      // console.log("enter ", path.type)
      // if (path.type == "Identifier") {
      //   path.node.name += "_enter"
        
      // }
    },
    CallExpression(path) {
      // 拿到 callee 数据
      const { callee } = path.node
      console.log(path.findParent)

      // 判断是否是调用了 console.log 方法
      // 1. 判断是否是成员表达式节点，上面截图有详细介绍
      // 2. 判断是否是 console 对象
      // 3. 判断对象的属性是否是 log
      const isConsoleLog =
        types.isMemberExpression(callee) &&
        callee.object.name === "console" &&
        callee.property.name === "log";
      if (isConsoleLog) {
        // 如果是 console.log 的调用 找到上一个父节点是函数
        const funcPath = path.findParent(p => {
          return p.isFunctionDeclaration();
        });
        // 取函数的名称
        const funcName = funcPath.node.id.name;
        // console.log(funcPath)
        // 将名称通过 types 来放到函数的参数前面去
        path.node.arguments.unshift(types.stringLiteral(funcName));
      }
    }
  }
  traverse.default(ast, visitor)

  // 3. generator 将 AST 转回成代码
  return generator.default(ast, {}, code)
}

const code = `
function getData() {
  console.log("data")
}
`
function Test(){
  console.log("data")
}

const newCode = compile(code)
console.log(newCode)

function MyAST(fun) {
  const funStr = fun.toString()
  return new Function('return ' + compile(funStr).code)()
}

const newFun = MyAST(Test)
newFun()

