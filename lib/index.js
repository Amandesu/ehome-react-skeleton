var fs = require("fs");
var path = require("path");
var Promise = require('es6-promise').Promise;
var traverse = require("babel-traverse").default;
var compileLess = require("./compile-less");
var compileCode = require("./compile-code");
var { parse, generate,  initTraverseAst, clone} = require("./helper");




module.exports = function(content){
    let ast = parse(content)
    let context = this.context;
    let { lessPath, templateAst, prefixCls} = initTraverseAst(ast, content);
    if (!lessPath || !templateAst || !prefixCls) {
        return content
    }
    const callback = this.async();
    const CompileJs = function() {
        return Promise.resolve(compileCode(ast, templateAst, prefixCls));
    }
    const CompileStyle = function() {
        return compileLess(lessPath, prefixCls, context)
    }
    Promise.all([CompileJs(), CompileStyle()]).then(function(sections) {
       let styleast = parse(sections[1]);
       let ast = sections[0];

       let stylePath = null;
       traverse(styleast, {

            ExpressionStatement(path){
                if (!stylePath) {
                    stylePath = clone(path)
                }
            }
       })

       traverse(ast, {
            VariableDeclaration(path){
                if (stylePath && path.node.declarations.some(decla => decla.id.name == "prefixSkeleton") ) {
                    path.replaceWithMultiple([path.node, stylePath.node])
                    stylePath = null;
                }
            }
       })
       callback(null, generate(ast));
    })
}
