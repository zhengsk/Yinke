

  // 实例化一个DIYManagerClass类
  var DiyManager = new DIYManagerClass($("#diy_content"));



    // 键盘操作
    $(document).keydown(function(e){
        if(e.keyCode == 46){DiyManager.delDiyElement();}; //删除元素
        if(e.keyCode == 37){DiyManager.moveElementBy(-1,0); }; //左方向键
        if(e.keyCode == 39){DiyManager.moveElementBy(1,0); }; //右方向键
        if(e.keyCode == 38){DiyManager.moveElementBy(0,-1); }; //上方向键
        if(e.keyCode == 40){DiyManager.moveElementBy(0,1); }; //下方向键

        if(e.ctrlKey && !e.shiftKey &&e.keyCode == 90){DiyManager.history.back(); }; //撤销操作
        if(e.ctrlKey && (e.shiftKey && e.keyCode == 90 || e.keyCode == 89)){DiyManager.history.forward();}; //恢复操作

        if(e.keyCode == 61){DiyManager.scaleDiyFramePhoto(6/5)} // 加号
        if(e.keyCode == 173){DiyManager.scaleDiyFramePhoto(5/6)} // 减号
    })

    //工具栏 -- 撤销
    $("#operate_undo").click(function(){DiyManager.history.back();});

    //工具栏 -- 恢复
    $("#operate_redo").click(function(){DiyManager.history.forward();});

    
    //工具栏 -- 删除
    $("#operate_del").click(function(){DiyManager.delDiyElement();});

    //工具栏 -- 预览
    $("#operate_preview").click(function(){
      DiyManager.cancelEdit();
      var html = "<div class='preview_wp'>" + document.getElementById("diy_content").innerHTML + "</div>";
      $.colorbox({html:html});
    });

    //工具栏 -- 上移一层
    $("#operate_upLayer").click(function(){
      DiyManager.moveIndex(1);
    });

    //工具栏 -- 下移一层
    $("#operate_downLayer").click(function(){
      DiyManager.moveIndex(-1);
    });

    //工具栏 -- 保存
    $("#operate_save").click(function(){
      //DiyManager.getDiyAllData().toSource();
      alert(JSON.stringify(DiyManager.getDiyAllData()))
    });

    //工具样 -- 文字 字体
    $("#text_fontFamily").change(function(event){
        DiyManager.setTextStyle("fontFamily",this.value)
    });

    //工具样 -- 文字 大小
    $("#text_fontSize").change(function(event){
        DiyManager.setTextStyle("fontSize",this.value)
    });

    //工具样 -- 文字 颜色
    $("#text_fontColor").change(function(event){
        DiyManager.setTextStyle("color",'#'+this.value)
    });

    





    // 文本，背景，装饰，边框，拖动
    $("#menu .diy_text")
    .add("#menu .diy_background")
    .add("#menu .diy_decorate")
    .add("#menu .diy_frame")
    .delegate("img","mouseover",function(){
      $(this).draggable({
        cursor: "move",
        appendTo: "body",
        scope:"diy_diy",
        helper: function(e,ui){
            return $("<img class='dragging_img' src='"+ this.getAttribute('src') +"' data-type='"+ this.getAttribute('data-type') +"' data-info='"+ this.getAttribute('data-info') +"' />")
        },
        revert: "invalid",
        cursorAt: { top: 20, left: 70 }
      });

    });


    // 图片拖动 普通添加 与 添加到边框中
    $("#menu .diy_photo").delegate("img","mouseover",function(){
        $(this).draggable({
            cursor: "move",
            appendTo: "body",
            scope:"diy_diy",
            helper: function(e,ui){return $("<img class='dragging_img' src='"+ this.getAttribute('src') +"' data-type='"+ this.getAttribute('data-type') +"' data-info='"+ this.getAttribute('data-info') +"' />")},
            revert: "invalid",
            cursorAt: { top: 20, left: 70 },
            start : function(e,ui){ // 边框实现可放入功能
                $( "#diy_content>div.diyFrame" ).droppable({
                    activeClass: "diy_diy_active",
                    hoverClass: "diy_diy_hover",
                    scope:"diy_diy",
                    over: function(event, ui){
                        ui.helper.css({transform: 'scale(1.2,1.2)',"opacity":0.7});
                        DiyManager.container.droppable( "disable" );
                    },
                    out: function(event, ui){
                        ui.helper.css({transform: 'scale(1)',"opacity":1});
                        DiyManager.container.droppable( "enable" );
                    },
                    drop: function(event, ui) {
                        DiyManager.addDiyFramePhoto($(this),event,ui); // 添加边框图片
                        DiyManager.container.removeClass("diy_diy_active diy_diy_hover").droppable( "enable" );
                        return false;
                    }
                });
            },
            stop : function(e,ui){
                $( "#diy_content>div.diyFrame" ).droppable("destroy");
            }
        });

    });
    





    // 实现放入效果
    $( "#diy_content" ).droppable({
        activeClass: "diy_diy_active",
        hoverClass: "diy_diy_hover",
        scope:"diy_diy",
        over: function(event, ui){
          ui.helper.css({transform: 'scale(1.2,1.2)',"opacity":0.7});
        },
        out: function(event, ui){
          ui.helper.css({transform: 'scale(1)',"opacity":1});
        },
        drop: function(event, ui) {

            if(ui.helper.attr("data-type") == "diy_photo"){
              DiyManager.addDiyPhoto($(this),event,ui); // 添加图片
              return;
            }

            if(ui.helper.attr("data-type") == "diy_text"){
              DiyManager.addDiyText($(this),event,ui); // 添加文本
            }

            if(ui.helper.attr("data-type") == "diy_background"){
              DiyManager.addDiyBackground($(this),event,ui); // 添加背景
            }

            if(ui.helper.attr("data-type") == "diy_decorate"){
              DiyManager.addDiyDecorate($(this),event,ui); // 添加装饰
            }

            if(ui.helper.attr("data-type") == "diy_frame"){
              DiyManager.addDiyFrame($(this),event,ui); // 添加装饰
            }
                              
        }
    });



    //加载模版
    $("#modulBar_list").click(function(e){
        var target = e.target;
        if(target.tagName.toUpperCase() === "IMG"){
          var modulId = target.getAttribute("data-modulid");
          if(modulId){
              $.ajax({
                type:"get",
                dataType:"json",
                url:"ajax/modul_02.html?modulId=" + modulId,
                success:function(result){
                  DiyManager.setDiyData(result);
                },
                error:function(){alert("出错了")}
              });
          };
          document.getElementById("modulOn") && (document.getElementById("modulOn").id = "");
          target.id = "modulOn"
        }
    });
