var path = require("path");
var fs = require("fs");
var autoprefixer = require('autoprefixer');
var postcss = require('postcss');
var less = require("postcss-less-engine");
var rework = require('rework');

module.exports = function(lessPath, prefixCls, context){
    var lessCode = fs.readFileSync(path.resolve(context,lessPath), "utf-8").replace(new RegExp(prefixCls, "g"), prefixCls+"-skeleton")
    let styleTemplate = (code) => {
        return `(function(){
            var style = document.createElement("style");
            style.type = "text/css"
            style.innerHTML= \`${code}\`;
            document.getElementsByTagName("HEAD").item(0).appendChild(style);
        })()`
    }
    return postcss([
        less({ strictMath: true }),
        autoprefixer()
    ]).process(lessCode, { parser: less.parser, from:path.resolve(context,lessPath )}).then(function (result) {
        var r = rework(result.css).use(function(sheets) {
            sheets.rules = sheets.rules.map(rule => {
                let isfont = rule.declarations.some(declar => {
                    if (declar.property.indexOf("font") > -1) {
                        return true;
                    }
                })
                if (isfont) {
                   rule.declarations.push({
                        type:"declaration",
                        property:"background-color",
                        value:"#F5F5F5"
                    })
                }
                rule.declarations.map(declar => {
                    if (declar.property.indexOf("background-image") > -1) {
                        declar.property = "background-color";
                        declar.value = "#F5F5F5"
                    }
                })
                return rule;
            })
            return sheets;
       })
       return styleTemplate(r.toString());
    })
}
