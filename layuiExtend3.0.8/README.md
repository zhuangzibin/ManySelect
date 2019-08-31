# layuiExtend——dynamicCondition

[更新日志以及相关说明文档](https://blog.csdn.net/xiaozaq/article/details/89156726)  
喜欢的话，请大家记得点击 watch 和 star。后续升级更新能及时通知，谢谢！  
升级高版本是完全兼容低版本的，可以直接覆盖低版本就可以了。  
ps：  
升级v3.0.0以上版本只是覆盖dynamicCondition.js和dc.css文件。  
如果删除dcConfig.js文件，v3版本是完全兼容低版本的。  
v3版本新增了dcConfig.js文件对全局做默认配置，这个可以不用覆盖，根据自己需要进行配置。  
由于我的项目是将弹窗模式统一改为了非弹窗模式。所以添加dcConfig.js后会导致和低版本显示不一样。  

#### 项目介绍  
最近做一个档案系统，发现字段超多，查询页面布局不是很好弄，于是就想着干脆写一个动态添加条件的ui插件。

因为是用的layui框架写的系统，所以就直接基于layui编写了个插件。写篇文章总结介绍下这个插件。   
  
[点击查看插件详细介绍](https://fly.layui.com/extend/dynamicCondition)   

按查询条件是否弹窗分为：弹窗/无弹窗 模式   
按查询条件是否复杂分为：简单/复杂 模式   
各模式优点：  
1.简单模式：传统查询可以在不改后台代码情况下替换成简单模式。   
2.复杂模式：条件可以选择等于，包含，范围，不等于，开头字符，结尾字符，为空等。有些查询必须要求这些功能。   
3.弹窗模式：同时需要的查询条件比较多时，一行显示不全会导致界面不好看。这时可以考虑使用弹窗模式。   
4.无弹窗模式：提供的查询条件较多，但每次查询只需选择1-3个条件时，考虑使用无弹窗模式。  
 
具体使用组合就有四种模式。可以选择合适的使用。他们互相切换起来也比较简单。   
1.简单/无弹窗模式：该模式与传统的查询条件UI最接近。可以在不改后台代码情况下替换成改模式。    
2.复杂/无弹窗模式：个人比较推荐使用该模式。需要后台编写相应逻辑配合使用。    
3.复杂/弹窗模式：查询条件超过3个时，推荐使用。条件太多导致界面很难看，通过弹窗模式可以让界面更精简。   
4.简单/弹窗模式：查询条件超过5个时，推荐使用。条件太多导致界面很难看，通过弹窗模式可以让界面更精简。  

[下载源码](https://gitee.com/pelin0963/layuiExtend/releases)  
体验地址1：[动态添加条件查询Demo](https://pelin0963.gitee.io/layuiextend/layui_exts/dynamicCondition/demo/index.html)   
体验地址2：[带后台的查询demo](http://xn--pzsz6a02k.xn--6qq986b3xl:9090/xpl/demo/dynamicCondition)   
使用文档参考：  
[基于layui的动态添加条件查询ui插件——组件相关api与数据字典](https://blog.csdn.net/xiaozaq/article/details/83662679)   
[高级查询组件dynamicCondition升级为v2.0.0版本——组件使用步骤](https://blog.csdn.net/xiaozaq/article/details/84872222)  
[高级查询组件dynamicCondition升级为v2.0.0——扩展编辑器](https://blog.csdn.net/xiaozaq/article/details/84872233)  
[高级查询组件下拉框联动（三）](https://blog.csdn.net/xiaozaq/article/details/84872750)  
[dynamicCondition组件升级为2.0.2版本 ](https://blog.csdn.net/xiaozaq/article/details/85757959)  

demo界面（无弹窗模式）：  
![Image text](https://img-blog.csdnimg.cn/2019010409541622.png)  
demo界面（弹窗模式）：  
![Image text](https://pelin0963.gitee.io/layuiextend/img/demo4.png)  









