# webpack4
```
cnpm i
npm run dev
```

参考链接:
[webpack4.x最详细入门讲解](https://www.cnblogs.com/BetterMan-/p/9867642.html)
[入门Webpack，看这篇就够了](url=GdX-HT51EVXLTQbVPoYlKAjX9g-mvPQIZdBbcbcwVUM0f3xbXvyz-xZP2iLy2nz3&wd=&eqid=ead458980000f934000000045eb3c55c)
[babel 升级到7.X采坑总结](https://segmentfault.com/a/1190000016458913、https://www.baidu.com/link?)

webpack4-react-antd-demo

               |___ dist  打包目录

               |___ assets 静态，公共资源目录

               |___  public 静态，公共资源目录

                            |___ index.html 入口

               |___ src 

                            |___ components 组件目录

                                               |___ Button 组件Button

                                                                  |___ button.jsx 组件文件

                                                                  |___ button.scss 样式文件 或者是button.css

                            |___ pages 页面目录

                                                |___ Index 首页

                                                                  |___ index.jsx 首页

                                                                  |___ index.scss 样式文件

                            |___ reduxs 存储redux状态，action，reducer目录

                                                |___ actions 存放redux action目录

                                                                   |___ action.js

                                                |___ reducer 存放redux reducer目录

                                                                   |___ reduce.js

                            |___ router 路由目录

                                                 |___ router.js

                            |___ index.jsx 入口

               |___ .babelrc babel配置文件

               |___ postcss.config.js postcss配置文件

               |___ webpack.common.js webpack公共配置文件

               |___ webpack.prod.js webpack配置文件 打包时使用

               |___ webpack.dev.js webpack配置文件 开发时使用
————————————————