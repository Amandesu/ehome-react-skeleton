
var babylon  = require('babylon');
var traverse = require("babel-traverse").default;
var generate = require("babel-generator").default;
var clone    = require("lodash").cloneDeep;
var t = require('babel-types');

// 将js或jsx代码转化为ast
const parse = (code) => {
    return babylon.parse(code, {
        sourceType: 'module',
        plugins: [
          'jsx',
          'flow',
          'doExpressions',
          'objectRestSpread',
          'decorators',
          'classProperties',
          'exportExtensions',
          'asyncGenerators',
          'functionBind',
          'functionSent',
          'dynamicImport'
        ]
    })
};


module.exports = {
    parse, clone , t,
    // 将ast转化为code
    generate(ast){
        return generate(ast).code
    },
    initTraverseAst(ast){
        let templateAst = null;    // SKELETON模板ast
        let lessPath = "";        // 判断是否引入了index.less文件
        let prefixCls = "";
        traverse(ast, {
            // 判断在render中的JSX是否存在SKELETON字段
            ClassMethod(path){
                if (path.node.key.name == "render") {
                    path.traverse({
                        JSXElement(path){
                            let attributes = path.node.openingElement.attributes;
                            let isTemplate =  attributes.some((attr) => {
                                if (attr.name && attr.name.name == "SKELETON") {
                                    return true;
                                }
                            })
                            if (isTemplate) {
                               templateAst= clone(path)
                            }
                        }
                    })
                }
            },
            ImportDeclaration(path) {
                let value = path.node.source.value
                if(value.indexOf("index.less") > -1) {
                    lessPath = value;
                }
            },
            VariableDeclarator(path){
                if (path.node.id.name == "prefix") {
                    prefixCls = path.node.init.value;
                }
            }
        })
        return {
            templateAst,
            lessPath,
            prefixCls
        };
    }
}
