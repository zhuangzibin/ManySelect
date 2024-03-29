
/**
 @Name： dynamicCondition 用户配置文件,修改配置后没生效，请注意清除缓存
 @Author：xpl
 @version: 3.0.6 2019-05-23 支持从dcConfig中扩展编辑器。新增下拉树编辑器treeSelect。
 @version: 2019-04-09
 */
layui.define(['jquery'], function (exports) {
    "use strict";

    var MOD_NAME = 'dcConfig',
        $ = layui.jquery;

    var myConfig  = {
    		type: 'complex',//取值：'simple'/'complex'默认为复杂模式。区别1.显示界面不一样，2.构造的requestData格式不一样。
    		requestDataType: 'array',//取值：'array'/'json'.请求参数类型。默认array。
    		instanceName: 'instanceName',//创建的实例名称。非必须。默认为'instanceName'。当一个页面只创建一个实例时，可以不用该参数
    		displayModel: 'unpopup',//显示模型。取值：'popup'/'unpopup'。 默认"popup"点击后提出查询条件设置窗口。unpopup模式则不弹出窗口，直接在界面上设置条件。
    		counts: 3,//默认初始化条件数。
    		popupMsgText: "查询条件：",//弹窗模式下msg默认提示文本。之前版本默认为“查询条件：”
    		popupBtnsWidth: 120,//弹窗模式下按钮工具面板宽度。500px
    		popupShowQueryBtn: false, //弹窗模式下，是否显示查询按钮。之前版本默认是不显示的
    		unpopupBtnswidth: 180,//非弹窗模式下按钮工具面板宽度。500px
    		unpopupShowAddBtn: false, //非弹窗模式下，是否显示新增条件按钮。之前版本默认是不显示的
    		extendBtns:function(btnDivJq, instance){
    			//下面可以添加扩展按钮
    			if($("#toolbarBts").size()>0){//弹窗模式统一改为非弹窗模式
    				var toolBtsJq = $("<div><div>");
    				toolBtsJq.append($("#toolbarBts").html());
    				var btsJq = toolBtsJq.find(".layui-btn");
    				btsJq.removeClass("layui-btn-xs");
    				btnDivJq.append(btsJq.not("a:contains(查询)"));
    			}
    			//btnDivJq.append($("<a class='layui-btn my-btn' onclick='dcSave();'>新增</a>"));
//		    	btnDivJq.append($("<a class='layui-btn my-btn'>扩展按钮1</a>"));
//				btnDivJq.append($("<a class='layui-btn my-btn'>扩展按钮2</a>"));
//				btnDivJq.append($("<a class='layui-btn my-btn'>扩展按钮3</a>"));
//				btnDivJq.find(".my-btn").on("click",function(){
//					layer.msg('触发【'+$(this).text()+'】按钮点击事件！');;
//			    });
    		},
    };
    /***
     * 扩展dynamicCondition组件
     */
    myConfig.extendDC = function(_dc){
    	//扩展下拉树编辑器
    	extendTreeSelectEditor(_dc);
    }
    /***
     * 扩展下拉树编辑器 tree
     * 使用该编辑器，li元素必须配置dataURL属性
     * @param _dc
     */
    function extendTreeSelectEditor(_dc){
    	_dc.createEditor("treeSelect",{
		  	createElement:function(item){
		  		var randomId= "rd" + (Math.random()+"").substr(2);
		  		var ele = $('<input type="text" id="'+randomId+'"  lay-filter="'+randomId+'"  class="layui-input xpl-treeSelect">');
				return ele;
			}
		  	,fillElement:function(ele, val){
		  		var eleId = $(ele).attr("id");
		  		$(ele).attr("curVal",val.value);
		  		$(ele).attr("curText",val.text);
		  		if($(ele).attr("initcomplete") && val.value){
		  			layui.treeSelect.checkNode(eleId, val.value);
	        	}
			}
			,getRequestValue:function(ele){
				return $(ele).attr("curVal");
			}
			,getRequestText:function(ele){
				return $(ele).attr("curText") || this.getRequestValue(ele);
			}
			,render:function(ele, item){
				var that = this;
				//下拉树初始化
				var eleId = $(ele).attr("id");
				var curVal = $(ele).attr("curVal");
				if(layui.treeSelect){
					layui.treeSelect.render({
				        // 选择器
				        elem: '#'+eleId,
				        // 数据
				        data: item.url,
				        // 异步加载方式：get/post，默认get
				        type: item.ajaxType || "post",
				        // 占位符
				        placeholder: item.placeholder||"",
				        // 是否开启搜索功能：true/false，默认false
				        search: true,
				        // 点击回调
				        click: function(d){
							$(ele).attr("curVal",d.current.id);
							$(ele).attr("curText",d.current.name);
							//console.log(d);
				        },
				        // 加载完成后的回调函数
				        success: function (d) {
				        	//console.log(d);
				        	//选中节点，根据id筛选
				        	$(ele).attr("initcomplete","true");
				        	if(curVal){
				        		that.fillElement(ele, {value:curVal});
				        	}
				        }
				    });
				}

			}
	  });

    }
    exports(MOD_NAME, myConfig);
})