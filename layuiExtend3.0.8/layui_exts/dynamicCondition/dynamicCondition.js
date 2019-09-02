/**
 @Name： dynamicCondition 动态添加查询条件
 @Author：xpl
 @version:  3.0.8 2019-08-01 优化：文本输入框，按回车键触发查询操作。
 @version:  3.0.7 2019-05-28 修复allowDel定义失效bug。
 @version:  3.0.6 2019-05-23 支持从dcConfig中扩展编辑器。新增下拉树编辑器treeSelect
 @version:  3.0.5 2019-04-27 li新增initVal，initLeftVal，initRightVal属性初始便于初始控件值。
 @version:  3.0.4 2019-04-26 新增parseToRequest方法。用于直接使用js解析生成请求参数。
 @version:  3.0.3 2019-04-22 li新增dateType属性。支持日期选择格式化。默认值为“date”。
 @version:  3.0.2 2019-04-11 text和date编辑器支持placeholder特性。修复select编辑器templet对应select的id重复导致不正常显示问题。
 @version:  3.0.1 2019-04-10 修复counts值大于条件数产生的bug。
 @version:  3.0.0 2019-04-09 新增大量特性。ui升级，css与js分离。
 @version:  2.0.6 2019-04-08 修复简单模式下删除条件失效问题。
 @version:  2.0.5 2019-03-28 修复渲染问题
 @version:  2.0.4 2019-03-22 修复一些小bug
 @version:  2.0.2 2019-01-04 新增查询条件无弹窗模式。
 	码云地址：https://gitee.com/pelin0963/layuiExtend/releases
 	在线demo：https://pelin0963.gitee.io/layuiextend/layui_exts/dynamicCondition/demo/index.html
 	qq:305916516
 */
layui.extend({
	dcConfig: 'dynamicCondition/dcConfig'
}).define(['jquery', 'table', 'form', 'laydate', 'dcConfig'], function(exports) {
	"use strict";
	layui.link(layui.cache.base + 'dynamicCondition/dc.css');
	var MOD_NAME = 'dynamicCondition',
		$ = layui.jquery,
		dcConfig = layui.dcConfig || {},
		laydate = layui.laydate,
		table = layui.table,
		form = layui.form;
	var tempVal = {
		value: "",
		text: ""
	};

	//创建实例
	var createInstance = function(_config) {
		var instance = {
			data: [],
			config: _config,
			requestData: {},
			cacheCondition: [] //缓存查询条件
				,
			conditionContainerId: (Math.random() + "").substr(2) //随机日期id
				,
			conditionFieldWidth: _config.conditionFieldWidth || 120 //第一列默认宽度
				,
			conditionOptionWidth: _config.conditionOptionWidth || 100 //第二列默认宽度
				,
			conditionValueWidth: _config.conditionValueWidth || 150 //第三列默认宽度
				,
			height: 380 //弹出窗口默认高度
				,
			width: 610 //弹出窗口默认宽度
		};
		if(instance.config.type != "complex") {
			instance.width = instance.width - instance.conditionOptionWidth;
		}
		/**设置显示模式
		 * displayModel,取值：'popup'/'unpopup'
		 * */
		instance.setDisplayModel = function(displayModel) {
			instance.config.displayModel = displayModel || instance.config.displayModel;
			if(instance.config.displayModel == "unpopup") {
				instance.conditionValueWidth = 100;
				instance.buildConditionHtmlForUnpopup();
				if(instance.openPageIndex) {
					layer.close(instance.openPageIndex);
				}
			} else {
				instance.conditionValueWidth = 150;
				instance.buildConditionHtml();
			}
		}
		/**根据字段名称获取对应的配置项*/
		instance.getObjByField = function(conditionFieldVal) {
			for(var i = 0; i < instance.data.length; i++) {
				if(instance.data[i].field == conditionFieldVal) {
					return instance.data[i];
				}
			}
			return null;
		}
		/**根据字段名称获取行div，返回一个dom类型的数组*/
		instance.getRowDivs = function(conditionFieldVal) {
			var rs = [];
			var allRowDivJqs = $("#" + instance.conditionContainerId).find(".conditionRow");
			allRowDivJqs.each(function() {
				var selVal = $(this).find(".conditionField option:selected").val();
				if(conditionFieldVal == selVal) {
					rs.push($(this)[0]);
				}
			})
			return rs;
		}
		/**根据字段名称获对应的值，如果该字段条件有多个，则只取第一行对应的值。*/
		instance.getVal = function(conditionFieldVal) {
			var rs = instance.getRowDivs(conditionFieldVal);
			if(rs.length == 0) {
				//没有对应的的值
				return null;
			}
			var rowDiv = rs[0];
			var eleJq = rowDiv.eleJq;
			var eleLeftJq = rowDiv.eleLeftJq;
			var eleRightJq = rowDiv.eleRightJq;
			if(eleJq) {
				return rowDiv.curEditor.getRequestValue(eleJq);
			}
			//操作符是between时返回2个值
			else if(eleLeftJq) {
				return {
					left: rowDiv.curEditor.getRequestValue(eleLeftJq),
					right: rowDiv.curEditor.getRequestValue(eleRightJq)
				};
			}
			//当操作符是empty时返回null
			return null;
		}
		/**根据字段名称获对应的值，如果该字段条件有多个，则只取第一行对应的值。*/
		instance.getValText = function(conditionFieldVal) {
			var rs = instance.getRowDivs(conditionFieldVal);
			if(rs.length == 0) {
				//没有对应的的值
				return null;
			}
			var rowDiv = rs[0];
			var eleJq = rowDiv.eleJq;
			var eleLeftJq = rowDiv.eleLeftJq;
			var eleRightJq = rowDiv.eleRightJq;
			if(eleJq) {
				return {
					value: rowDiv.curEditor.getRequestValue(eleJq),
					text: rowDiv.curEditor.getRequestText(eleJq)
				};
			}
			//操作符是between时返回2个值
			else if(eleLeftJq) {
				return {
					left: {
						value: rowDiv.curEditor.getRequestValue(eleLeftJq),
						text: rowDiv.curEditor.getRequestText(eleLeftJq)
					},
					right: {
						value: rowDiv.curEditor.getRequestValue(eleRightJq),
						text: rowDiv.curEditor.getRequestText(eleRightJq)
					}
				};
			}
			//当操作符是empty时返回null
			return null;
		}
		/**设置初始条件
		 * conditionArr,例：
		 * */
		instance.setCondition = function(conditionArr) {
			for(var i = 0; i < conditionArr.length; i++) {
				//初始赋值
				var conditionTemp = conditionArr[i];
				var conditionFieldVal = conditionTemp[0];
				var item = instance.getObjByField(conditionFieldVal);
				var conditionValueVal = item["init-val"];
				var conditionValueLeftVal = item["init-left-val"];
				var conditionValueRightVal = item["init-right-val"];
				conditionTemp[1] = conditionTemp[1] || "equal";
				var conditionOptionVal = conditionTemp[1];
				if(conditionOptionVal == "between") {
					conditionTemp[2] = conditionTemp[2] || {
						value: conditionValueLeftVal
					};
					conditionTemp[3] = conditionTemp[3] || {
						value: conditionValueRightVal
					};
				} else {
					conditionTemp[2] = conditionTemp[2] || {
						value: conditionValueVal
					};
				}
			}
			//缓存查询条件
			var cacheCondition = parseToCacheCondition(conditionArr, instance.config.type);
			instance.cacheCondition = cacheCondition;
			instance.setDisplayModel();
			instance.lastRequestData = instance.buildRequestData();
		}
		/**新增条件*/
		instance.addRow = function() {
//			field++;
//			console.log(field)
//			layid = con+field;
//			console.log(layid)
			var conditionContainerJq = $("#" + instance.conditionContainerId);
			var conditionRowJq = $('<div class="conditionRow"></div>');
			if(instance.config.type == "complex") {
				var width = instance.conditionFieldWidth + instance.conditionOptionWidth + 2 * instance.conditionValueWidth + 20 + 60;
				//				  conditionRowJq.css("width", width);
			} else {
				var width = instance.conditionFieldWidth + 2 * instance.conditionValueWidth + 20 + 60;
				//				  conditionRowJq.css("width", width);
			}
			//字段
			var conditionField = $('<div class="layui-inline conditionField" id="'+ divid +'"></div>');
			divid++;
			console.log("divid"+divid)
			//			  conditionField.width(instance.conditionFieldWidth);
			conditionField.append($(instance.conditionFieldHtml));
			//操作
			var conditionOption = $('<div class="layui-inline conditionOption"></div>');
			//			  conditionOption.width(instance.conditionOptionWidth);
			conditionOption.append($(instance.conditionOptionHtml));
			//值
			var conditionValue = $('<div class="layui-inline conditionValue"></div>');
			//			  conditionValue.width(instance.conditionValueWidth*2+20);
			var conditionDel = $('<div class="layui-inline conditionDel"></div>');
			//			  conditionDel.width(30);
			//删除按钮
			var delJq = $('<a href="javascript:void(0);" class="delRowBtn"><i class="layui-icon layui-icon-close"></i></a>');
			conditionDel.append(delJq);
			conditionRowJq.append(conditionField);
			conditionRowJq.append(conditionOption);
			conditionRowJq.append(conditionValue);
			conditionRowJq.append(conditionDel);
			conditionContainerJq.find(".conditionDiv").append(conditionRowJq);

			//删除事件
			delJq.on("click", function() {
				conditionRowJq.remove();
			});

			//			  if(instance.config.type == "simple"){
			//				  conditionOption.hide();
			//			  }
			return conditionRowJq;
		}
		/**更新conditionValue*/
		instance.updateConditionValue = function(conditionRowJq, conditionObj) {
			var conditionValueJq = conditionRowJq.find(".conditionValue");
			var conditionFieldVal = conditionRowJq.find("select[name='conditionField']").val();
			var obj = instance.getObjByField(conditionFieldVal);
			//没有对应的obj，则不用更新conditionValue
			if(!obj) {
				return;
			}
			if(!conditionObj) {
				conditionObj = {
					conditionValueVal: {
						value: obj["initVal"]
					},
					conditionValueLeftVal: {
						value: obj["initLeftVal"]
					},
					conditionValueRightVal: {
						value: obj["initRightVal"]
					},
				}
			}
			//    		  conditionObj = conditionObj || {conditionValueVal:{},conditionValueLeftVal:{},conditionValueRightVal:{}}
			if(conditionObj.conditionOptionVal) {
				conditionRowJq.find("select[name='conditionOption']").val(conditionObj.conditionOptionVal);
			}
			var conditionOptionVal = conditionRowJq.find("select[name='conditionOption']").val();

			//指定操作选项
			if(obj.allowDel === "true") {
				//允许删除的条件，下拉字段选项排除掉不能删除条件字段。
				removeOption(conditionRowJq.find("select[name='conditionField']"), instance.fieldList);
			}
			//指定操作选项
			if(obj.ops) {
				removeOption(conditionRowJq.find("select[name='conditionOption']"), obj.ops);
				//删除后可能conditionOptionVal值会改变。比如本来默认是equal，由于该选项删除了，导致默认值是between了。
				conditionOptionVal = conditionRowJq.find("select[name='conditionOption']").val();
			}
			//conditionValueJq div中缓存对应的edit和conditionOptionVal，以后优化只有当edit和conditionOptionVal改变时才考虑更新conditionValueJq
			var old_field = conditionValueJq.attr("field");
			var old_edit = conditionValueJq.attr("edit");
			var old_conditionOptionVal = conditionValueJq.attr("conditionOptionVal");
			conditionValueJq.attr("field", obj.field);
			conditionValueJq.attr("edit", obj.edit);
			conditionValueJq.attr("conditionOptionVal", conditionOptionVal);
			var curEditor = dynamicCondition.editor[obj.edit];
			conditionRowJq[0].curEditor = curEditor;
			if(conditionOptionVal == "empty") {
				conditionValueJq.html("");
				//				  form.render(null, 'conditionDiv'+instance.conditionContainerId);
				return;
			}
			if(curEditor) {
				if(conditionOptionVal == "between") {
					var eleLeftJq = $(curEditor.createElement(obj));
					var eleRightJq = $(curEditor.createElement(obj));
					var divLeft = $("<div style='display:inline-block'></div>");
					var divRight = $("<div style='display:inline-block'></div>");

					divLeft.append(eleLeftJq);
					divLeft.attr("name", "conditionValueLeft");
					divLeft.width(instance.conditionValueWidth);

					divRight.append(eleRightJq);
					divRight.attr("name", "conditionValueRight");
					divRight.width(instance.conditionValueWidth);

					//更新conditionValueJq
					conditionValueJq.html("");
					conditionValueJq.append(divLeft);
					conditionValueJq.append("<span style='margin:auto 3px;'>至</span>");
					conditionValueJq.append(divRight);
					//必须将jq对象转换为dom对象才能绑定对象属性。
					conditionRowJq[0].eleJq = null;
					conditionRowJq[0].eleLeftJq = eleLeftJq;
					conditionRowJq[0].eleRightJq = eleRightJq;
					curEditor.fillElement(eleLeftJq, conditionObj.conditionValueLeftVal);
					curEditor.fillElement(eleRightJq, conditionObj.conditionValueRightVal);
					curEditor.render(eleLeftJq, obj);
					curEditor.render(eleRightJq, obj);
				} else {
					var eleJq = $(curEditor.createElement(obj));
					var divJq = $("<div></div>");
					divJq.append(eleJq);
					divJq.attr("name", "conditionValue");
					conditionValueJq.html("");
					conditionValueJq.append(divJq);
					//					  divJq.attr("xpl-dc-val",conditionObj.conditionValueVal);
					//必须将jq对象转换为dom对象才能绑定对象属性。
					conditionRowJq[0].eleJq = eleJq;
					conditionRowJq[0].eleLeftJq = null;
					conditionRowJq[0].eleRightJq = null;
					curEditor.fillElement(eleJq, conditionObj.conditionValueVal);
					curEditor.render(eleJq, obj);
				}
				//				  form.render(null, 'conditionDiv'+instance.conditionContainerId);
				return;
			}
		}
		/**校验表单*/
		instance.verifyForm = function() {
			var verifySuccess = true;
			var conditionContainerJq = $("#" + instance.conditionContainerId);
			var verify = form.config.verify,
				DANGER = 'layui-form-danger',
				verifyElem = conditionContainerJq.find('*[lay-verify]') //获取需要校验的元素

			//开始校验
			for(var i = 0; i < verifyElem.length; i++) {
				var item = verifyElem[i];
				var othis = $(item),
					vers = othis.attr('lay-verify').split('|'),
					verType = othis.attr('lay-verType') //提示方式
					,
					value = othis.val();
				othis.removeClass(DANGER);
				var errorText;
				//是否允许空值
				var allowBlank = true;
				layui.each(vers, function(_, thisVer) {
					if(thisVer.indexOf("required") >= 0) {
						//不允许为空值
						allowBlank = false;
					}
				})
				//允许为空值
				if(allowBlank) {
					if(value == "") {
						//校验通过，如果还有其他的pass，number等也不用校验了。
						continue;
					}
				}
				//不允许为空值，继续校验
				for(var j = 0; j < vers.length; j++) {
					var isTrue = null //是否命中校验
						,
						thisVer = vers[j] //校验name，如：required，pass 等
						,
						errorText = '' //错误提示文本
						,
						isFn = typeof verify[thisVer] === 'function';
					//匹配验证规则
					if(verify[thisVer]) {
						isTrue = isFn ? errorText = verify[thisVer](value, item) : !verify[thisVer][0].test(value);
						errorText = errorText || verify[thisVer][1];
						//isTrue为true，则验证不通过
						if(isTrue) {
							verifySuccess = false;
							//提示
							layer.tips(errorText, function() {
								if(typeof othis.attr('lay-ignore') !== 'string') {
									if(item.tagName.toLowerCase() === 'select' || /^checkbox|radio$/.test(item.type)) {
										return othis.next();
									}
								}
								return othis;
							}(), {
								tips: [1, '#FF0000']
							});
							othis.addClass(DANGER);
							return verifySuccess;
						}
					}
				}
			}
			return verifySuccess;
		}
		/**根据动态查询条件构造缓存对应的请求条件*/
		instance.buildCacheCondition = function() {
			var conditionContainerJq = $("#" + instance.conditionContainerId);
			var conditionRowJqs = conditionContainerJq.find(".conditionRow");
			var rowLength = conditionRowJqs.size();
			//缓存查询条件
			var cacheCondition = [];
			for(var i = 0; i < rowLength; i++) {
				var conditionRowJq = conditionRowJqs.eq(i);
				var valJq = conditionRowJq.find("[name='conditionValue']");
				var valLeftJq = conditionRowJq.find("[name='conditionValueLeft']");
				var valRightJq = conditionRowJq.find("[name='conditionValueRight']");

				var conditionObj = {};
				conditionObj.conditionFieldVal = conditionRowJq.find("select[name='conditionField']").val();
				conditionObj.conditionOptionVal = conditionRowJq.find("select[name='conditionOption']").val();
				var item = instance.getObjByField(conditionObj.conditionFieldVal);
				var curEditor = dynamicCondition.editor[item.edit];
				if(curEditor) {
					var conditionRowDOM = conditionRowJq[0];
					var tempjq = conditionRowDOM.eleJq;
					conditionObj.conditionValueVal = tempjq ? {
						value: curEditor.getRequestValue(tempjq),
						text: curEditor.getRequestText(tempjq)
					} : tempVal;
					tempjq = conditionRowDOM.eleLeftJq;
					conditionObj.conditionValueLeftVal = tempjq ? {
						value: curEditor.getRequestValue(tempjq),
						text: curEditor.getRequestText(tempjq)
					} : tempVal;
					tempjq = conditionRowDOM.eleRightJq;
					conditionObj.conditionValueRightVal = tempjq ? {
						value: curEditor.getRequestValue(tempjq),
						text: curEditor.getRequestText(tempjq)
					} : tempVal;
				}
				cacheCondition.push(conditionObj);
			}
			instance.cacheCondition = cacheCondition;
			return cacheCondition;
		}
		/**根据动态查询条件构造对应的请求参数.*/
		instance.buildRequestData = function(cacheCondition) {
			var cacheCondition = cacheCondition || instance.cacheCondition;
			//设置请求参数
			instance.requestData = parseToRequest(cacheCondition, instance.config.type, instance.config.requestDataType);
			return instance.requestData;
		}
		/**根据动态查询条件构造对应的显示文本*/
		instance.buildConditionHtml = function() {

			var cacheCondition = instance.cacheCondition;
			var conditionHtml = "";
			var fieldSelectJq = $(instance.conditionFieldHtml);
			var optionSelectJq = $(instance.conditionOptionHtml);
			var blankStr = "&nbsp;&nbsp;";
			for(var i = 0; i < cacheCondition.length; i++) {
				var conditionObj = cacheCondition[i];
				var fieldText = fieldSelectJq.find("option[value='" + conditionObj.conditionFieldVal + "']").text();
				var OptionText = optionSelectJq.find("option[value='" + conditionObj.conditionOptionVal + "']").text();
				var ValueText = conditionObj.conditionValueVal.text;
				var ValueLeftText = conditionObj.conditionValueLeftVal.text;
				var ValueRightText = conditionObj.conditionValueRightVal.text;

				var rsValueText = "";
				if(conditionObj.conditionOptionVal == "between") {
					rsValueText = ValueLeftText + blankStr + "至" + blankStr + ValueRightText;
				} else {
					rsValueText = ValueText;
				}
				rsValueText = rsValueText || "";
				//简单模式
				var spanJq = $("<span class='layui-xpl-dc-circle' index=" + i + "></span>");

				if(instance.config.type == "simple") {
					spanJq.html(fieldText + blankStr + ":" + blankStr + rsValueText);
					//conditionHtml += fieldText + blankStr + ":" + blankStr + rsValueText;
				}
				//复杂模式
				else {
					spanJq.html(fieldText + blankStr + OptionText + blankStr + rsValueText);
					//    				conditionHtml += fieldText + blankStr + OptionText + blankStr + rsValueText;
				}
				var iJq = $('<i class="layui-icon layui-icon-close layui-xpl-dc-delete"></i>');
				var item = instance.getObjByField(conditionObj.conditionFieldVal);
				iJq.attr("allowDel", item.allowDel);
				spanJq.append(iJq);
				conditionHtml += spanJq.prop("outerHTML");
			}
			instance.conditionHtml = "<div class='xpl-dc-popup-query-condition-div'>" + instance.config.popupMsgText + conditionHtml + "</div>";
			if(instance.config.conditionTextId) {
				var msgJq = $(instance.config.conditionTextId);
				msgJq.html(instance.conditionHtml);
				msgJq.append($("<div class='xpl-dc-popup-btns'></div>"));
				var btnsJq = msgJq.find(".xpl-dc-popup-btns");
				btnsJq.width(instance.config.popupBtnsWidth);
				var hideFlag = instance.config.popupShowQueryBtn ? "" : " xpl-hide ";
				btnsJq.append($("<a class='layui-btn xpl-popup-query" + hideFlag + "'))>查询</a>"));
				btnsJq.find(".xpl-popup-query").on("click", function() {
					instance.open();
				})
				if(instance.config.extendBtns) {
					instance.config.extendBtns(btnsJq, instance);
				}
				msgJq.append($("<div class='xpl-clear'></div>")); //清除浮动
				msgJq.find(".xpl-dc-popup-query-condition-div").width(msgJq.width() - btnsJq.width());
				msgJq.find(".layui-xpl-dc-delete").on("click", function() {
					instance.delete(this);
				})
				msgJq.find(".layui-xpl-dc-delete[allowDel='false']").hide();
			}
		}
		/**针对无弹窗的显示模式根据动态查询条件构造对应的显示界面*/
		instance.buildConditionHtmlForUnpopup = function() {
			if(instance.config.conditionTextId) {
				var msgJq = $(instance.config.conditionTextId);
				msgJq.html("");
				instance.render(msgJq);

				msgJq.append($("<div class='xpl-dc-unpopup-btns'></div>"));
				var btnDivJq = msgJq.find(".xpl-dc-unpopup-btns");
				btnDivJq.width(instance.config.unpopupBtnswidth);
				btnDivJq.append($("<a id='xpl-unpopup-query" + instance.conditionContainerId + "' class='layui-btn xpl-unpopup-query'))>查询</a>"));
				var hideFlag = instance.config.unpopupShowAddBtn ? "" : " xpl - hide ";
				btnDivJq.append($("<a class='layui-btn xpl-unpopup-add" + hideFlag + "'))>新增条件</a>"));
				if(instance.config.extendBtns) {
					instance.config.extendBtns(btnDivJq, instance);
				}
				msgJq.append($("<div class='xpl-clear'></div>"));
				btnDivJq.find(".xpl-unpopup-query").on("click", function() {
					if(instance.verifyForm()) {
						//    				  layer.msg('校验通过');
						instance.buildCacheCondition();
						instance.query();
					} else {
						//    				  layer.msg('校验失败');
					}
				});
				btnDivJq.find(".xpl-unpopup-add").on("click", function() {
					msgJq.find(".layui-xpl-dc-top-btns .addRowBtn").click();
				});
			}
		}
		/**删除条件*/
		instance.delete = function(ele) {
			var index = $(ele).parent().attr("index");
			instance.cacheCondition.splice(index, 1);
			instance.buildConditionHtml();
			instance.query();
		}
		/**查询*/
		instance.query = function() {
			//    		instance.buildConditionHtml();
			instance.buildRequestData();
			//ajax请求，重载数据
			if(instance.config.queryCallBack) {
				instance.config.queryCallBack(instance.requestData);
			}
			if(instance.config.tableId) {
				//查看是否有排序
				if(instance.config.sortObj) {
					instance.requestData["sortField"] = sortObj.field; //排序字段
					instance.requestData["sortOrder"] = sortObj.type; //排序方式
				}
				//因为layui的table会缓存上次查询参数，所以删除的条件必须将原值置空。如果直接将原条件删除，则请求会带上上次缓存的条件。
				var params = {};
				if(instance.config.type == "simple") {
					instance.lastRequestData = instance.lastRequestData || {};
					//原条件置空
					for(var attr in instance.lastRequestData) {
						instance.lastRequestData[attr] = ''; //后台接收参数时，请忽略空字符串的条件参数。
					}
					$.extend(params, instance.lastRequestData);
					$.extend(params, instance.requestData);
					//缓存本次查询条件
					instance.lastRequestData = params;
				} else {
					//复制模式请求参数是数组模式，通过数组长度可以控制，所以不用考虑缓layui缓存问题
					params = instance.requestData;
				}
				//				  var curPage = $(".layui-laypage-next").attr("data-page") - 1;
				table.reload(instance.config.tableId, {
					page: {
						curr: 1 //重新加载当前页
					},
					where: params
				});
			}
		}
		/**打开窗口，动态添加查询条件*/
		instance.open = function() {
			if(instance.config.displayModel == 'unpopup') {
				//如果是非弹窗模式，则直接查询，不弹出窗口。
				$("#" + instance.conditionContainerId).parent().find(".xpl-unpopup-query").click();
				return;
			}
			if($("#" + instance.conditionContainerId).length > 0) {
				//已经打开了，不能重复打开。
				return;
			}

			//页面层-自定义
			instance.openPageIndex = layer.open({
				type: 1,
				id: 'dynamicCondition' + instance.conditionContainerId, //防止重复弹出
				offset: '50px',
				title: "查询条件",
				//closeBtn: 0,
				shade: 0, //不显示遮罩
				area: [instance.width + 'px', instance.height + 'px'], //宽高
				maxmin: true,
				//    		  content: conditionContainerHtml
				content: "<div id='query" + instance.conditionContainerId + "'></div>"
			});
			instance.render($("#query" + instance.conditionContainerId));
		}
		/**渲染弹出界面*/
		instance.render = function(divJq) {
			divJq = divJq || $("#query" + instance.conditionContainerId);
			var conditionContainerHtml = '<div id="' + instance.conditionContainerId + '" class="conditionContainer" lay-filter="conditionContainer"><div class="layui-xpl-dc-top-btns"><a href="javascript:void(0);" style="margin-left:10px;" class="addRowBtn"><i class="layui-icon layui-icon-add-circle-fine" style="font-size: 30px; color: &#xe608;"></i> </a> <a href="javascript:void(0);" style="margin-left:10px;" class="queryBtn" ><i class="layui-icon layui-icon-search" style="font-size: 30px; color: &#xe615;"></i> </a> </div><div class="conditionDiv layui-form" lay-filter="conditionDiv' + instance.conditionContainerId + '"></div></div>';
			divJq.append($(conditionContainerHtml));
			var conditionContainerJq = $("#" + instance.conditionContainerId);
			//添加 弹窗/非弹窗 样式
			if(instance.config.displayModel == "unpopup") {
				conditionContainerJq.addClass("xpl-dc-unpopup");
			} else {
				conditionContainerJq.addClass("xpl-dc-popup");
			}
			//添加 复杂/简单 样式
			if(instance.config.type == "complex") {
				conditionContainerJq.addClass("xpl-dc-complex");
			} else {
				conditionContainerJq.addClass("xpl-dc-simple");
			}
			var cacheCondition = instance.cacheCondition;
			for(var i = 0; i < cacheCondition.length; i++) {
				var conditionObj = cacheCondition[i];
				var conditionRowJq = instance.addRow();
				conditionRowJq.find("select[name='conditionField']").val(conditionObj.conditionFieldVal);
				conditionRowJq.find("select[name='conditionOption']").val(conditionObj.conditionOptionVal);
				instance.updateConditionValue(conditionRowJq, conditionObj);

				var conditionFieldVal = conditionRowJq.find("select[name='conditionField']").val();
				var item = instance.getObjByField(conditionObj.conditionFieldVal);
				if(item.allowDel === "false") {
					//隐藏删除按钮
					conditionRowJq.find(".delRowBtn").hide();
					//移除其他下拉选项
					//		  			conditionRowJq.find("select[name='conditionField']").attr("disabled","disabled");
					removeOption(conditionRowJq.find("select[name='conditionField']"), conditionObj.conditionFieldVal);
				}
			}
			instance.afterOpen();
			conditionContainerJq.css("margin", "10px");
			//监听事件
			form.on('select(conditionField)', function(data) {
				if($(data.elem).find("option").length > 1) {
					var conditionRowJq = $(data.elem).parents(".conditionRow");
					//更新操作选项
					var conditionOption = conditionRowJq.find(".conditionOption");
					conditionOption.html(instance.conditionOptionHtml);
					instance.updateConditionValue(conditionRowJq);
					form.render(null, 'conditionDiv' + instance.conditionContainerId);
				}
			});
			form.on('select(conditionOption)', function(data) {
				if($(data.elem).find("option").length > 1) {
					var conditionRowJq = $(data.elem).parents(".conditionRow");
					instance.updateConditionValue(conditionRowJq);
				}
			});
			//新增
			conditionContainerJq.find(".addRowBtn").on("click", function() {
				field++;
				console.log(field)
				layid = con+field;
				console.log(layid)
				var rowJq = instance.addRow();
				instance.updateConditionValue(rowJq);
				form.render(null, 'conditionDiv' + instance.conditionContainerId);
			});
			var verify = form.config.verify
			//查询
			conditionContainerJq.find(".queryBtn").on("click", function() {
				if(instance.verifyForm(conditionContainerJq)) {
					//    				  layer.msg('校验通过');
					instance.buildCacheCondition();
					instance.buildConditionHtml();
					instance.query();
					layer.close(instance.openPageIndex);
					instance.openPageIndex = null;
				} else {
					//    				  layer.msg('校验失败');
				}
			});
			form.render(null, 'conditionDiv' + instance.conditionContainerId);

		}
		/**渲染后执行*/
		instance.afterOpen = function() {
			if(instance.config.afterOpen) {
				instance.config.afterOpen(instance);
			}
		}
		return instance;
	}
	var defaultValueConfig = {
		type: 'complex', //取值：'simple'/'complex'默认为复杂模式。区别1.显示界面不一样，2.构造的requestData格式不一样。
		requestDataType: 'array', //取值：'array'/'json'.请求参数类型。默认array。
		instanceName: 'instanceName', //创建的实例名称。非必须。默认为'instanceName'。当一个页面只创建一个实例时，可以不用该参数
		displayModel: 'unpopup', //显示模型。取值：'popup'/'unpopup'。 默认"popup"点击后提出查询条件设置窗口。unpopup模式则不弹出窗口，直接在界面上设置条件。
		counts: 5, //默认初始化条件数。
		popupMsgText: "查询条件：", //弹窗模式下msg默认提示文本。之前版本默认为“查询条件：”
		popupBtnsWidth: 500, //弹窗模式下按钮工具面板宽度。500px
		popupShowQueryBtn: false, //弹窗模式下，是否显示查询按钮。之前版本默认是不显示的
		unpopupBtnswidth: 180, //非弹窗模式下按钮工具面板宽度。500px
		unpopupShowQueryBtn: false, //非弹窗模式下，是否显示新增条件按钮。之前版本默认是不显示的
	};
	//继承用户自定义配置。
	$.extend(defaultValueConfig, dcConfig);
	var dynamicCondition = {
		version: '2.0.6'
			//编辑器：自带3个默认编辑器：文本text，下拉框select，日期date
			,
		editor: {},
		defaultValue: defaultValueConfig
			//缓存创建的实例
			,
		cacheInstance: {}
		//根据输入构造请求参数。该接口主要是个工具函数，便于直接通过js生成请求参数调用后台接口。
		,
		parseToRequest: function(conditionArr, type, requestDataType) {
				var cacheCondition = parseToCacheCondition(conditionArr, type);
				var requestMap = parseToRequest(cacheCondition, type, requestDataType);
				return requestMap;
			}
			/***
			 * 获取实例
			 * instanceName:实例名称。非必须。默认为'instanceName'.当一个页面只创建一个实例时，可以不用该参数
			 */
			,
		getInstance: function(instanceName) {
				instanceName = instanceName || this.defaultValue.instanceName;
				var instanceMap = this.cacheInstance;
				var instance = instanceMap[instanceName];
				if(!instance) {
					for(var obj in instanceMap) {
						if(instanceMap[obj].conditionContainerId == instanceName) {
							instance = instanceMap[obj];
							return instance;
						}
					}
				}
				return instance;
			}
			/***
			 * elem/fields/fieldsJsonStr：三选一.
			 * tableId/queryCallBack: 二选一。tableId对应table.render(config)的config.id参数.自动重载表格。queryCallBack(requestData)则自定义回调
			 * type: 取值：'simple'/'complex'.默认为复杂模式。区别1.显示界面不一样，2.构造的requestData格式不一样。
			 * requestDataType: 取值：'array'/'json'.请求参数类型。默认array。
			 * conditionTextId: 显示查询条件的面板选择器或DOM。非必须。例子："#frm"
			 * sortObj:排序。非必须。例子：{field:'name',type:'desc'}
			 * instanceName: 创建的实例名称。非必须。默认为'instanceName'。当一个页面只创建一个实例时，可以不用该参数
			 * displayModel: 显示模型。取值：'popup'/'unpopup'。 默认"popup"点击后提出查询条件设置窗口。unpopup模式则不弹出窗口，直接在界面上设置条件。
			 */
			,
		create: function(config) {
			var _config = {};
			//加载用户配置, 系统默认值this.defaultValue ——》用户定义默认值dcConfig ——》页面实例化默认值config
			$.extend(_config, this.defaultValue, config);
			config = _config;
			var instance = createInstance(config);
			//初始化instance.data
			if(config.fields) {
				instance.data = config.fields;
			} else if(config.fieldsJsonStr) {
				instance.data = $.parseJSON(config.fieldsJsonStr);
			} else if(config.elem) { //指定容器的选择器或 DOM，方法渲染方式必填.示例"#dcDemo"，或者DOM
				var liObjs = $(config.elem).find("li");
				liObjs.each(function() {
					var item = {};
					//attrList数组中的属性，通过this.attributes获取到属性名称可能变小写。所以需要特别处理下。
					var attrList = ["allowDel"];
					var attrLowerList = [];
					for(let i = 0; i < attrList.length; i++) {
						attrLowerList.push(attrList[i].toLowerCase());
					}
					$.each(this.attributes, function() {
						// this.attributes is not a plain object, but an array
						// of attribute nodes, which contain both the name and value
						if(this.specified) {
							var idx = attrLowerList.indexOf(this.name.toLowerCase())
							item[idx == -1 ? this.name : attrList[idx]] = this.value
						}
					});
					instance.data.push(item);
				})
			}
			//设定默认值
			for(var i = 0; i < instance.data.length; i++) {
				var item = instance.data[i];
				item.edit = item.edit || "text";
				item.allowDel = typeof item.allowDel == "undefined" ? "true" : "" + item.allowDel;
				item.placeholder = item.placeholder || "";
				item.dateType = item.dateType || "date";
			}
			//字段下拉框html
			console.log("一次")
			var selectConditionField = $('<select name="conditionField" class="sel" lay-filter="'+layid+'" id="'+layid+'" onchange="fn2(this)"></select>');
			console.log("两次")
			var items = instance.data;
			instance.fieldList = "";
			instance.showItems = [];
			for(var i = 0; i < items.length; i++) {
				if(items[i].show != "false") {
					instance.showItems.push(items[i]);
					selectConditionField.append("<option value='" + items[i].field + "'>" + items[i].title + "</option>");
					if(items[i].allowDel != "false") {
						instance.fieldList += "," + items[i].field;
					}
				}
			}
			instance.conditionFieldHtml = selectConditionField.prop("outerHTML");
			
			
			
			
			//操作 下拉框html
			var selectconditionOption = $('<select name="conditionOption" lay-filter="conditionOption"></select>');
			selectconditionOption.append("<option value='equal'>等于</option>");
			selectconditionOption.append("<option value='like'>包含</option>");
			selectconditionOption.append("<option value='between'>范围</option>");
			selectconditionOption.append("<option value='start'>开头字符</option>");
			selectconditionOption.append("<option value='end'>结尾字符</option>");
			selectconditionOption.append("<option value='unequal'>不等于</option>");
			selectconditionOption.append("<option value='empty'>为空</option>");
			instance.conditionOptionHtml = selectconditionOption.prop("outerHTML");
			//缓存实例
			this.cacheInstance[config.instanceName] = instance;
			var conditionArr = [];
			if(config.counts) {
				for(var i = 0; i < config.counts && i < instance.showItems.length; i++) {
					var conditionObj = [instance.showItems[i].field];
					var _item = instance.showItems[i];
					var ops = _item.ops;
					if(ops) {
						var idx = ops.indexOf(",");
						conditionObj.push(idx == -1 ? ops : ops.substring(0, idx));
					} else {
						conditionObj.push(null);
					}
					conditionArr.push(conditionObj);
				}
			}
			instance.setCondition(conditionArr);
			//如果counts为0，且是非弹窗模式，unpopupShowAddBtn为false。则隐藏查询按钮。
			if(instance.config.counts == 0 && instance.config.displayModel == 'unpopup' && instance.config.unpopupShowAddBtn == true) {
				$("#" + instance.conditionContainerId).parent().find(".xpl-unpopup-query").hide();
			}
			return instance;
		}
	};

	/***
	 * 输入框内按回车键事件触发查询操作
	 * @param ele
	 * @returns
	 */
	function enterQuery(ele) {
		//非弹窗模式
		$(ele).keydown(function(e) {
			e = e || window.event;
			var _ele = $(this);
			var conditionContainerJq = _ele.parents(".conditionContainer").eq(0);
			var conditionContainerId = conditionContainerJq.attr("id");
			var instance = dynamicCondition.getInstance(conditionContainerId);
			var keycode = e.which ? e.which : e.keyCode;
			if(keycode == 13) {
				//回车事件
				if(instance.config.displayModel == "unpopup") {
					var btnId = 'xpl-unpopup-query' + conditionContainerId;
					$("#" + btnId).click();
				} else {
					conditionContainerJq.find(".queryBtn").click();
				}
			}
		});

	}
	var editor = {
		/***
		 * 生成DOM对象ele,jquery封装返回$(ele)
		 * item: li标签解析的对应json对象
		 * return ele,或者$(ele)
		 */
		createElement: function(item) {
				return $("<div></div>");
			}
			/***
			 * 初始值填充DOM
			 * ele createElement 生成的对象
			 * val 值
			 */
			,
		fillElement: function(ele, val) {
				$(ele).val(val.value);
				$(ele).attr("oldVal", val.value);
			}
			/***
			 * 用于ajax请求提交的参数值
			 */
			,
		getRequestValue: function(ele) {
				return $(ele).val();
			}
			/***
			 * 查询条件中显示的值,默认与getRequestValue一致
			 */
			,
		getRequestText: function(ele) {
				return this.getRequestValue(ele);
			}
			/***
			 * ele创建后渲染
			 * ele: createElement 生成的对象
			 * item: li标签解析的对应json对象
			 */
			,
		render: function(ele, item) {
			enterQuery(ele);
		}
	};
	/***
	 * 创建一个编辑器。
	 * editorName 编辑器名称
	 */
	dynamicCondition.createEditor = function(editorName, defEditor) {
		defEditor = defEditor || {};
		dynamicCondition.editor[editorName] = {};
		$.extend(dynamicCondition.editor[editorName], editor, defEditor);
		return dynamicCondition.editor[editorName];
	}
	//定义文本编辑器
	var editorText = dynamicCondition.createEditor("text");
	$.extend(editorText, {
		createElement: function(item) {
			var inputJq = $('<input type="text" class="layui-input" placeholder="' + item.placeholder + '" />');
			if(item.layVerify) {
				inputJq.attr("lay-verify", item.layVerify);
			}
			return inputJq;
		}
	});

	//定义下拉框编辑器
	var editorSelect = dynamicCondition.createEditor("select");
	$.extend(editorSelect, {
		createElement: function(item) {
			var selectHtml;
			if($(item.templet).is("select")) {
				selectHtml = $(item.templet).prop("outerHTML");
			} else {
				selectHtml = $(item.templet).html();
			}
			var selJq = $(selectHtml);
			selJq.removeAttr("id");
			return selJq;
		},
		getRequestText: function(ele) {
			return ele.find("option:selected").text();
		},
		render: function(ele, item) {

			//		    	form.render('select')
		}
	});
	//定义日期编辑器
	var editorDate = dynamicCondition.createEditor("date");
	$.extend(editorDate, {
		createElement: function(item) {
			var dateType = item.dateType || "date";
			var dateJq = $('<input type="text" class="layui-input" placeholder="' + item.placeholder + '" />');
			dateJq.attr("date-type", dateType);
			if(item.layVerify) {
				dateJq.attr("lay-verify", item.layVerify);
			}
			laydate.render({
				elem: dateJq[0],
				type: dateType
			});
			return dateJq;
		}
	});
	/***
	 * selDom下拉选项的值不在valList列表中，则移除
	 */
	function removeOption(selDom, valList) {
		valList = "," + valList + ",";
		var opJqs = $(selDom).find("option").each(function() {
			if(valList.indexOf("," + $(this).val() + ",") == -1) {
				$(this).remove();
			}
		});
	}
	/**
	 * 根据传参构造cacheCondition
	 */
	function parseToCacheCondition(conditionArr, type) {
		type = type || defaultValueConfig.type;
		//缓存查询条件
		var cacheCondition = [];
		for(var i = 0; i < conditionArr.length; i++) {
			var curCondition = conditionArr[i];
			var conditionObj = {};
			conditionObj.conditionFieldVal = curCondition[0];
			if(!curCondition[1] || type == "simple") {
				curCondition[1] = "equal";
			}
			conditionObj.conditionOptionVal = curCondition[1];

			curCondition[2] = curCondition[2] || "";
			curCondition[3] = curCondition[3] || "";
			conditionObj.conditionValueVal = tempVal
			conditionObj.conditionValueLeftVal = tempVal
			conditionObj.conditionValueRightVal = tempVal
			//如果第三个参数curCondition[2]是对象，说明其值是{value:"",text:""}格式，不是对象则，统一转换为该格式
			var valTemp2 = curCondition[2];
			if(typeof curCondition[2] != "object") {
				valTemp2 = {
					value: curCondition[2],
					text: curCondition[2]
				};
			}
			if(curCondition[1] == "between") {
				conditionObj.conditionValueLeftVal = valTemp2;
				if(typeof curCondition[3] == "object") { //between选项才考虑第4个参数，否则忽略他
					conditionObj.conditionValueRightVal = curCondition[3];
				} else {
					conditionObj.conditionValueRightVal = {
						value: curCondition[3],
						text: curCondition[3]
					};
				}
			} else {
				conditionObj.conditionValueVal = valTemp2;
			}
			cacheCondition.push(conditionObj);
		}
		return cacheCondition;
	}

	/***
	 * 根据传参构造对应的请求参数.
	 * cacheCondition 查询条件
	 * type  简单模式 simple 和复杂模式, 默认
	 * requestDataType 请求数据格式'array'/'json'， 默认为array
	 */
	function parseToRequest(cacheCondition, type, requestDataType) {
		type = type || defaultValueConfig.type;
		requestDataType = requestDataType || defaultValueConfig.requestDataType;
		var requestData = {};
		var rowLength = cacheCondition.length;
		//简单模式
		if(type == "simple") {
			for(var i = 0; i < rowLength; i++) {
				var conditionObj = cacheCondition[i];
				requestData[conditionObj.conditionFieldVal] = conditionObj.conditionValueVal.value;
			}
			return requestData;
		}
		//复杂模式
		if(requestDataType == "json") { //结果为json字符串模式
			return {
				jsonStr: JSON.stringify(cacheCondition)
			};
		}
		requestData.rowLength = rowLength;
		for(var i = 0; i < rowLength; i++) {
			var conditionObj = cacheCondition[i];
			requestData["QueryCondition[" + i + "].conditionField"] = conditionObj.conditionFieldVal;
			requestData["QueryCondition[" + i + "].conditionOption"] = conditionObj.conditionOptionVal;
			requestData["QueryCondition[" + i + "].conditionValue"] = conditionObj.conditionValueVal.value;
			requestData["QueryCondition[" + i + "].conditionValueLeft"] = conditionObj.conditionValueLeftVal.value;
			requestData["QueryCondition[" + i + "].conditionValueRight"] = conditionObj.conditionValueRightVal.value;
		}
		return requestData;
	}
	if(dcConfig.extendDC) {
		//插件扩展
		dcConfig.extendDC(dynamicCondition);
	}

	exports(MOD_NAME, dynamicCondition);
})