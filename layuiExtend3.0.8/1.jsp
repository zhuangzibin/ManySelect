<!DOCTYPE html>
<html>

	<head>
		<meta charset="UTF-8">
		<title></title>
		<script src="../../../layui/layui.js"></script>
		<script src="../../../layui/layui.all.js" type="text/javascript" charset="utf-8"></script>
	</head>

	<body>
		<form class="layui-form" action="">

			<div class="layui-inline">
				<label class="layui-form-label">分组选择框</label>
				<div class="layui-input-inline">
					<select name="quiz">
						<option value="">请选择问题</option>
						<optgroup label="城市记忆">
							<option value="你工作的第一个城市">你工作的第一个城市</option>
						</optgroup>
						<optgroup label="学生时代">
							<option value="你的工号">你的工号</option>
							<option value="你最喜欢的老师">你最喜欢的老师</option>
						</optgroup>
					</select>
				</div>
			</div>

			<!--<div class="layui-form-item">
				<label class="layui-form-label">选择框</label>
				<div class="layui-input-block">
					<select name="city" lay-filter="test" lay-verify="required" id="a">
						<option value=""></option>
						<option value="0">北京</option>
						<option value="1">上海</option>
						<option value="2">广州</option>
						<option value="3">深圳</option>
						<option value="4">杭州</option>
					</select>
				</div>
			</div>-->
		</form>
		<script type="text/javascript">
			layui.use('form', function(obj) {
				console.log("1");
				var form = layui.form;
				console.log("11");
				form.on('select', function(data) {
					console.log("111");
					console.log(data.elem); //得到select原始DOM对象
					console.log(data.value); //得到被选中的值
					console.log(data.othis); //得到美化后的DOM对象
				});
				/* form.on('select(city)', function(data1){
		    console.log(data1.value)//打印当前select选中的值
		    console.log("1");
		    alert("1");
			form.render('select');
			alert(("#a").val());
		    }*/

			});
		</script>
	</body>

</html>