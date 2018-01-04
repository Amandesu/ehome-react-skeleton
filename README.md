## 安装
`cnpm i ehome-react-skeleton --save`
## 配置
```
{
    test:/\.(js|jsx)$/,
    include:paths.src,
    use:[
        {
            loader: require.resolve("babel-loader"),
            options: {
                "presets": [
                    "react-app"
                ]
            }
        },
        {
            loader:require.resolve("ehome-react-skeleton")  // 在babel-loader之前配置ehome-react-skeleton
        }
    ]

}
```
## 使用
    import React from "react";
    import ReactDom from "react-dom";
    import "./index.less";       //必须要有
    
    const prefix = "eh-record";
    export default class Record extends React.Component {
    
      componentWillMount() {
    
      }
      render() {
        const { state, props } = this;
        return <div className={`${prefix}`}>
                    <div className={`${prefix}-block`} SKELETON>   // (1)
                        <div className={`${prefix}-block-header`}>
                            <div>复印</div>
                            <div>已支付</div>
                        </div>
                        <div className={`${prefix}-block-date`}>
                            2012-2-08
                        </div>
                        <div className={`${prefix}-block-filemsg`}>
                            <div>我问问.word</div>
                            <div>￥0.2</div>
                        </div>
                    </div>
                    {SKELETON}   
                </div>;
      }
1. `index.less`文件
2. `div`上的`SKELETON`标记的为skeleton模板
3. 模板将替换{`SKELETON`}

## 效果
1. 模板中的图片将被替换成默认图片，`default.png`路径在src/images 所以在`src/images`目录下要添加`default.png`
2. 具有`font-size`的文字的将被清空，并添加默认背景色


**展示**
![1](https://github.com/Amandesu/ehome-react-skeleton/blob/master/demo/images/a.png)
![2](https://github.com/Amandesu/ehome-react-skeleton/blob/master/demo/images/b.png)
