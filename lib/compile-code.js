
var traverse = require("babel-traverse").default;
var {t, generate, clone} = require("./helper");
module.exports = function(ast, templateAst, prefixCls){
    let PrefixPath = null;
    // 处理templateAst
    templateAst.traverse({
        JSXOpeningElement(path){
            if (path.node.attributes.some(attr => attr.name && attr.name.name == "className")) {
                path.traverse({
                    TemplateLiteral(path){
                        path.traverse({
                            Identifier(path){
                                if (path.node.name == "prefix") {
                                    path.replaceWith(
                                        t.Identifier("prefixSkeleton")
                                    )
                                }
                            }
                        })
                    }
                })
            }
        },
        JSXExpressionContainer(path){
            let pName = path.parent.name;
            if (pName){
                if (pName.name == "style" || pName.name == "className") {
                    return ""
                } else if (pName.name == "src") {
                    let istranfrom = false;
                    path.traverse({
                        StringLiteral(path){
                            if (path.node.value == "images/default.png") {
                                istranfrom = true;
                            }
                        }
                    })
                    if (!istranfrom) {
                        let expression = t.CallExpression(
                            t.Identifier("require"),
                            [t.StringLiteral("images/default.png")]
                        )
                        return path.replaceWith(
                            t.JSXExpressionContainer(
                                t.TemplateLiteral(
                                    [t.templateElement({raw:"", cooked:""} ,false), t.templateElement({raw:"", cooked:""}, true)],
                                    [expression]
                                )

                            )
                        )
                    }

                } else {
                    path.remove();
                }
            } else {
                path.replaceWith(
                    t.JSXText("&nbsp;&nbsp;&nbsp;&nbsp;")
                )
            }
        },
        JSXText(path){

            let value = path.node.value;
            if(!/^[\s\n]+$/.test(value) && value !== "&nbsp;&nbsp;&nbsp;&nbsp;"){
                path.replaceWith
                (
                    t.JSXText("&nbsp;&nbsp;&nbsp;&nbsp;")
                )
            }
        }
    })

    traverse(ast, {
        // 新增prefixSkeleton变量
        VariableDeclaration(path){
            if (PrefixPath) {
                return;
            }
            let node = path.node;
            let isPrefixCls = node.declarations.some(declar => {
                if (t.isIdentifier(declar.id) && declar.id.name == "prefix") {
                    PrefixPath = clone(path)
                    return true
                }
            })
            if (isPrefixCls) {
                PrefixPath.traverse({
                    Identifier(path){
                        if (path.node.name == "prefix") {
                            path.replaceWith(t.Identifier("prefixSkeleton"))
                        }

                    },
                    StringLiteral(path){
                        if (path.node.value.indexOf("skeleton") == -1) {
                            path.replaceWith(t.StringLiteral(prefixCls+"-skeleton"))
                        }
                    }
                })
            }
            path.replaceWithMultiple([path.node, PrefixPath.node])
        },
        ClassMethod(path){
            if (path.node.key.name == "render") {
                path.traverse({
                    JSXExpressionContainer(path) {
                        path.traverse({
                            Identifier(path){
                                if(path.node.name == "SKELETON") {
                                    path.replaceWith(
                                        //t.assertJSXElement(JSXElementPath)
                                        t.jSXElement(
                                            templateAst.node.openingElement,
                                            templateAst.node.closingElement,
                                            templateAst.node.children,
                                            templateAst.node.selfClosing
                                        )
                                    )
                                }
                            }
                        })
                    }
                })
            }
        }
    });
    return ast;
}
