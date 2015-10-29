    // 管理编辑状态管理器
    function DIYManagerClass(diyContainer){

        var me = this;

        this.container = diyContainer;

        // 当前处于编辑状态的元素
        this.currentEdit = "";

        // 管理器内的所有元素
        this.DiyElements =[];

        // 创建DIY元素
        this.creatDiyElement = function(){

        }

        /*  
            添加元素到管理器 
                ele: 添加到管理器中的元素jQuery对象， 
                isEdit: 是否状态为选中编辑状态， 
                isHistory : 添加元素是否记录到历史记录中，默认为true
        */
        this.addDiyElement = function(ele,isEdit,isHistory){

            this.container.append(ele);

            if(ele.is("#diyBackground")){
              this.DiyElements.unshift(ele);
            }else{
              this.DiyElements.push(ele);
            }

            var isHistory = (typeof(isHistory) === "undefined") ? true : isHistory; // 是否加入历史记录中(默认为true)
            isHistory && (this.history.add("add",ele) + this.history.add("edit",ele));//添加到历史记录中 -- 添加元素

            if(isEdit){this.setElememtEdit(ele);}
        }

        // 删除指定元素
        this.delDiyElement = function(ele,isHistory){
            var isHistory = (typeof(isHistory) === "undefined") ? true : isHistory; // 是否加入历史记录中(默认为true)
            var ele = ele || this.currentEdit || 0;
            if(!ele){return false;} // 没有元素
            var isEditText = ele.attr("contenteditable");
            if( isEditText && isEditText == "true"){return false;} //文字处于编辑状态时不删除

            if(ele[0] == this.currentEdit[0]){this.cancelEdit()}; // 删除的元素为当前元素时，先取消当前状态

            for(var i =0, j = this.DiyElements.length; i < j; i++){
              if (ele[0] == this.DiyElements[i][0]){
                this.DiyElements.splice(i,1);
                isHistory && this.history.add("del",ele); // 添加到历史记录中 -- 删除元素
                ele.remove();
                if(ele == this.currentEdit) this.currentEdit = "";
                return false;
              }
            }
        };

        // 清空画布
        this.clearDiyElements = function(){
            this.cancelEdit();
            for(var i = this.DiyElements.length-1; i >= 0; i--){
              this.delDiyElement(this.DiyElements[i]);
            }
        };






        // 添加图片
        this.addDiyPhoto = function(container,event,ui,className){
            var contentOffset = container.offset();
            var img = document.createElement("img");
            img.src = ui.helper.attr('src');

            //下需要在mousedown取消默认操作;
            $(img).mousedown(function(event){event.preventDefault();});

            img.style.width = "100%";
            img.style.height = "100%";

            imgWp = document.createElement("div");
            imgWp.className = className || "diyPhoto";
            

            // 图片太大，计算出缩放比例
            var wRatio = ui.helper.width()/container.width();
            var hRatio = ui.helper.height()/container.height();
            var ratio = Math.max(wRatio,hRatio);
            ratio = ratio > 1 ? ratio : 1;

            imgWp.style.top = ui.offset.top - contentOffset.top + "px";
            imgWp.style.left = ui.offset.left - contentOffset.left + "px";
            imgWp.style.width = ui.helper.width()/ratio + "px";
            imgWp.style.height = ui.helper.height()/ratio + "px";

            imgWp.style.zIndex = this.DiyElements.length + 10; //层叠从10开始

            imgWp.setAttribute("data-type",ui.helper.attr("data-type"));
            imgWp.setAttribute("data-info",ui.helper.attr("data-info"));

            imgWp.appendChild(img);

            this.addDiyElement($(imgWp),true);
        }

        // 添加文本
        this.addDiyText = function(container,event,ui){
            var contentOffset = container.offset();

            var p = document.createElement("p");
            p.className = "divText";
            p.innerHTML = "双击编辑文字"
            p.setAttribute("data-type",ui.helper.attr("data-type"));
            p.setAttribute("style",ui.helper.attr("data-info"));
            p.style.top = ui.offset.top - contentOffset.top + "px";
            p.style.left = ui.offset.left - contentOffset.left + "px";
            p.style.fontSize = 20 + "px";
            p.style.zIndex = this.DiyElements.length + 10;
            this.addDiyElement($(p),true);
        }

        // 添加背景图片
        this.addDiyBackground = function(container,event,ui){
            var eleBackground = document.getElementById("diyBackground");
            if(eleBackground){
                eleBackground.src = ui.helper.attr('src');
                eleBackground.setAttribute("data-type",ui.helper.attr("data-type"));
                eleBackground.setAttribute("data-info",ui.helper.attr("data-info"));
                me.history.add('edit',$(eleBackground)); // 添加历史记录
            }else{
                eleBackground = document.createElement("img");
                eleBackground.src = ui.helper.attr('src');
                eleBackground.style.width = container.width() + "px";
                eleBackground.style.height = container.height() + "px";
                eleBackground.style.top = 0;
                eleBackground.style.left = 0;
                eleBackground.id = "diyBackground";
                eleBackground.className = "diyBackground";
                eleBackground.setAttribute("data-type",ui.helper.attr("data-type"));
                eleBackground.setAttribute("data-info",ui.helper.attr("data-info"));
                $(eleBackground).mousedown(function(event){event.preventDefault();});
                this.addDiyElement($(eleBackground),true);
            }
        }

        // 添加装饰
        this.addDiyDecorate = function(container,event,ui){
            this.addDiyPhoto(container,event,ui,"diyDecorate"); // 调用添加图片一样的方法
        }

        // 添加边框
        this.addDiyFrame = function(container,event,ui){
            this.addDiyPhoto(container,event,ui,"diyFrame"); // 调用添加图片一样的方法
        }

        // 添加边框图片
        this.addDiyFramePhoto = function(container,event,ui){
            var frame_w = container.width();
            var frame_h = container.height();

            var infoData = $.parseJSON(container.attr("data-info"));
            
            var ratio = frame_w / infoData.sw; // 边框的缩放比例
            var frame_in_w = infoData.w * ratio , frame_in_h = infoData.h * ratio; // 边框内图片可视区域大小

            var img = document.createElement("img");
            img.src = ui.helper.attr('src');

            var frameRation = infoData.w / infoData.h; // 边框可视区域的宽高比
            var imgSourceRatio = img.width / img.height; // 边框内图片的原始宽高比

            if(imgSourceRatio > frameRation){
                img.style.height = frame_in_h + "px";
                img.style.width = frame_in_h * imgSourceRatio + "px";
                img.style.left = -(frame_in_h * imgSourceRatio - frame_in_w)/2 + "px";
            }else{
                img.style.width = frame_in_w + "px";
                img.style.height = frame_in_w / imgSourceRatio + "px";
                img.style.top = -(frame_in_w / imgSourceRatio - frame_in_h)/2 + "px";
            }
            img.setAttribute("data-info",ui.helper.attr("data-info"));

            
            $(img).mousedown(function(event){event.preventDefault();});//下需要在mousedown取消默认操作;

            var diyFramePhoto = container.find("div.diyFramePhoto");
            if(!diyFramePhoto[0]){
                // 添加框架内图片
                var imgWp = document.createElement("div");
                imgWp.className = "diyFramePhoto"
                imgWp.style.left = infoData.x/infoData.sw * 100 + "%";
                imgWp.style.top = infoData.y/infoData.sh * 100 + "%";
                imgWp.style.width = infoData.w/infoData.sw * 100 + "%";
                imgWp.style.height = infoData.h/infoData.sh * 100 + "%";
                imgWp.appendChild(img);
                container.prepend($(imgWp));
                //添加历史记录
                this.history.add("editFrame",container);
            }else{
                // 替换框架内图片
                diyFramePhoto.find("img").remove().end().append($(img));
                this.history.add("editFrame",container);
            };

            //设置框架为编辑状态
            this.setEditFrame(container);
        }







        // 缩放框架内图片的大小
        this.scaleDiyFramePhoto = function(scale,ele){
            var ele = ele || this.currentEdit || 0;
            var diyFramePhoto = ele.find('div.diyFramePhoto')[0];
            if(!diyFramePhoto){return false}; // 找不到框架内的图片，则返回
            var photoStyle = diyFramePhoto.getElementsByTagName('img')[0].style;
            if(photoStyle && scale){

                // 得到可视区的宽高
                var canvas_half_w = parseInt(diyFramePhoto.offsetWidth) / 2;
                var canvas_half_h = parseInt(diyFramePhoto.offsetHeight) / 2;

                var sw = parseFloat(photoStyle.width);
                var sh = parseFloat(photoStyle.height);
                var nw = sw * scale
                var nh = sh * scale

                photoStyle.width = nw + 'px';
                photoStyle.height = nh + 'px';

                photoStyle.top = ((parseFloat(photoStyle.top) || 0) - canvas_half_h) * scale + canvas_half_h + 'px';
                photoStyle.left = ((parseFloat(photoStyle.left) || 0) - canvas_half_w) * scale + canvas_half_w + 'px';

                //添加历史记录
                this.history.add("editFrame",ele);
            }
        }

        // 设置图片为编辑状态
        this.setEditPhoto = function(ele){
            var me = this;
            me.cancelEdit();
            ele.resizable({ // 设置图片对象可缩放和拖动
                'containment':'parent'
                ,handles: "ne, se, sw, nw"
                ,aspectRatio: true
                ,stop: function(){me.history.add("edit",ele)}
            }).draggable({
                containment: "parent"
                ,stop: function(){me.history.add("edit",ele)}
            });

            diyRotatable(ele,'rotate');


            this.currentEdit = ele;
        };

        // 设置文本元素为选中状态
        this.setEditText = function(ele){
            // 如果为当前文本，则设置编辑文本
            if(this.currentEdit[0] == ele[0]){
              if(ele.attr("contentEditable") == true) return false; //如果文字已可编辑，则不处理
              this.setEditTextHTML(ele);
              return false;
            }

            this.cancelEdit();
            ele.draggable({containment: "parent",stop: function(){me.history.add("edit",ele)}});
            ele.addClass("divText_drag");
            this.currentEdit = ele;
        };

        // 设置文本元素编辑状态
        this.setEditTextHTML = function(ele){
            this.cancelEdit();
            ele.attr('contentEditable',true);
            ele.addClass("divText_edit");
            this.currentEdit = ele;
        };
        
        // 设置框架处于编辑状态
        this.setEditFrame = function(ele){
            var me = this;
            me.cancelEdit();
            ele.resizable({ // 设置图片对象可缩放和拖动
                'containment':'parent'
                ,handles: "ne, se, sw, nw"
                ,aspectRatio: true
                ,start : function(e,ui){
                    var diyFramePhoto = ui.element.find('div.diyFramePhoto')[0];
                    if(!diyFramePhoto){return false}; // 找不到框架内的图片，则返回
                    var imgStyle = diyFramePhoto.getElementsByTagName('img')[0].style;
                    
                    window._diyTempResizeDiyFrame = {};// 定义一个全局变量
                    window._diyTempResizeDiyFrame.width = parseFloat(imgStyle.width); 
                    window._diyTempResizeDiyFrame.height = parseFloat(imgStyle.height); 
                    window._diyTempResizeDiyFrame.left = parseFloat(imgStyle.left);
                    window._diyTempResizeDiyFrame.top = parseFloat(imgStyle.top);
                }
                ,resize: function(e,ui){
                    var diyFramePhoto = ui.element.find('div.diyFramePhoto')[0];
                    if(!diyFramePhoto){return false}; // 找不到框架内的图片，则返回
                    var imgStyle = diyFramePhoto.getElementsByTagName('img')[0].style;

                    var ratio = ui.element.width() / ui.originalSize.width;
                    imgStyle.width = window._diyTempResizeDiyFrame.width * ratio + "px";
                    imgStyle.height = window._diyTempResizeDiyFrame.height * ratio + "px";
                    imgStyle.left = window._diyTempResizeDiyFrame.left * ratio + "px";
                    imgStyle.top = window._diyTempResizeDiyFrame.top * ratio + "px";
                }
                ,stop: function(e,ui){
                    me.history.add("editFrame",ele);
                }
            }).draggable({
                containment: "parent"
                ,stop: function(){me.history.add("editFrame",ele)}
            });

            this.currentEdit = ele;

            diyFramePhotoEditToggle(ele,"edit"); // 设置框架内图片编辑图标
        }

        // 设置元素处于编辑状态
        this.setElememtEdit = function(ele){
            var eleType = ele.attr("data-type");
            this.cancelEdit();
            switch(eleType){
                case "diy_photo": this.setEditPhoto(ele); break;
                case "diy_text": this.setEditText(ele); break;
                case "diy_decorate": this.setEditPhoto(ele); break;
                case "diy_frame": this.setEditFrame(ele); break;

            }
        };

        // 取消当前处于编辑状态的元素
        this.cancelEdit = function(){
            var currentEle = this.currentEdit
            if(currentEle){
              if(currentEle.is(".diyPhoto") || currentEle.is(".diyDecorate")){ // 取消（图片||装饰||边框）编辑功能
                    currentEle.resizable("destroy").draggable("destroy");
              }else if(currentEle.is(".diyFrame")){
                    currentEle.resizable("destroy").draggable("destroy");
                    diyFramePhotoEditToggle(currentEle,"normal"); // 取消框架内图片的编辑图标
              }else if(currentEle.is(".divText")){// 取消文本编辑功能
                if(currentEle.is(".divText_drag")){
                    currentEle.removeClass("divText_drag").draggable("destroy");
                }else{
                    //currentEle[0].innerHTML = currentEle[0].innerText || currentEle[0].textContent;
                    currentEle.removeClass("divText_edit").attr("contentEditable",false);

                    // 如果文本内容发生变化，添加历史记录
                    var preHistory = me.history.findNearest(currentEle);
                    if(preHistory){
                        if(preHistory.data.info != currentEle[0].innerHTML){
                            me.history.add("edit",currentEle);
                        }
                    }

                }
              }
            }
            this.currentEdit = 0;
        };

        // 图层层叠(z-index)移动: step = 1:上移一层 step = 2:上移二层 step = -1:下移一层 
        this.moveIndex = function(step,ele,isEdit,isHistory){
            var ele = ele && ele[0] || this.currentEdit && this.currentEdit[0] || 0;
            if(!ele){return false;} // 没有元素
            var eles = arr_right = this.DiyElements;
            var arr_left = [];
            var find = false;
            
            if(eles.length < 2){return false;}; // 只有一张图
            
            for(var i = 0, j = eles.length; i < j; i++){
              
              if(find){
                this.DiyElements = eles = arr_left.concat(arr_right);
                for(var m = 0, n = eles.length; m < n; m++){
                  eles[m][0].style.zIndex = 10 + m;
                }
                var ele = $(ele);
                var isHistory = (typeof(isHistory) === "undefined") ? true : isHistory; // 是否加入历史记录中(默认为true)
                isHistory && (me.history.add('moveIndex',ele,step) + me.history.add('edit',ele)); // 改变层叠顺序要多加一条记录
                if(isEdit){this.setElememtEdit(ele);}
                return;
              };

              if(ele == eles[i][0]){
                var find = arr_right.shift();
                if(step < 0){
                  var arr_left_len = arr_left.length
                  if(step < -arr_left_len){step=-arr_left_len;}
                  step = (document.getElementById("diyBackground")&&step==-arr_left_len) ? 1 : step; //背景
                  arr_left.splice(step,0,find);
                }else{
                  arr_right.splice(step,0,find);
                }
              }else{
                arr_left.push(arr_right.shift());
                --i;
              };

            };
        };

        // 移动元素 -- 变化量
        this.moveElementBy = function(left,top,ele){
            var ele = ele || this.currentEdit || 0;
            if(!ele){return false;} // 没有元素
            if(ele.is(".divText_edit")&&(ele.attr("contentEditable") == "true")){return true;} // 编辑文字取消移动
            ele.css({
              top:function(index,value){
                return parseInt(value,10)+top;
              },left:function(index,value){
                return parseInt(value,10)+left;
              }
            });
        }

        // 移动元素 -- 指定量
        this.moveElementTo = function(left,top,ele){
            var ele = ele || this.currentEdit || 0;
            if(!ele){return false;} // 没有元素
            ele.css({top:top,left:left});
        }

        // 文本样式设置
        this.setTextStyle = function(attr,value,ele){
            var ele = ele || this.currentEdit || 0;
            if(!ele){return false;} // 没有元素
            ele.css(attr,value);
            me.history.add("edit",ele); // 添加到历史记录中
        }

        // 获取指定元素数据
        this.getDiyEleData = function(ele,forHistory){
            if(ele&&ele[0]){
            	var ele = ele[0];
				var type = ele.getAttribute('data-type');
				var cssText = ele.style.cssText;
				var info;

                if(type == 'diy_frame' && !forHistory){
                    info = ele.getAttribute('data-info');
                    var photo = $(ele).find('div.diyFramePhoto>img')[0];
                    var photoCssText = photo && photo.style.cssText || "";
                    var photoInfo = photo && photo.getAttribute("data-info") || "";
                    return {"type":type,"cssText":cssText,"info":JSON.parse(info),"photo":{"cssText" : photoCssText, "info" : photoInfo}};
                }else{
                    info = ele.getAttribute('data-info');
                }

				if(type == 'diy_photo' || type == 'diy_background' || type == 'diy_decorate'){
					info = ele.getAttribute('data-info');
				}else if(type == 'diy_text'){
					info = ele.innerHTML;
				}
				return {"type":type,"cssText":cssText,"info":info};
            }
        }

        // 获取画布所有数据： 画布及各元素数据
        this.getDiyAllData = function(){
            var allData = {
              "container":[this.container.width(),this.container.height()],
              "elements":[]
            };
            allData.container = [this.container.width(),this.container.height()];

            for(var DiyElements = this.DiyElements, i =0, j = DiyElements.length; i < j; i++){
              allData.elements.push(this.getDiyEleData(DiyElements[i],false));
            }
            return allData;
        }

        // 设置指定元素数据
        this.setDiyEleData = function(action,ele,data){
            // 图片
            if("diy_photo" == ele.type){
                
                if("edit" == action){
                    
                }
                
            };
        }

        // 获取所有各元素数据
        this.setDiyData = function(data){
            //console.dir(data)
            this.clearDiyElements(); // 清空画布

            //设置画布大小
            this.container.css({width:data.container[0],height:data.container[1]});

            var elements = data.elements;
            for(var i = 0, j = elements.length; i < j; i++){
              var ele = elements[i];

              // 背景图片
              if("diy_background" == ele.type){
                  var eleBackground = document.createElement("img");
                  eleBackground.src = ele.src;
                  eleBackground.id = "diyBackground";
                  eleBackground.className = "diyBackground";
                  eleBackground.style.cssText = ele.cssText;
                  $(eleBackground).mousedown(function(event){event.preventDefault();});
                  this.addDiyElement($(eleBackground),true);
                 
                  eleBackground.setAttribute("data-type",ele.type);
                  eleBackground.setAttribute("data-info",ele.info);
              };

              // 图片
              if("diy_photo" == ele.type){
                  var img = document.createElement("img");
                  img.src = ele.src;
                  
                  $(img).mousedown(function(event){event.preventDefault();});//下需要在mousedown取消默认操作;
                  img.style.width = "100%";
                  img.style.height = "100%";

                  imgWp = document.createElement("div");
                  imgWp.className = "diyPhoto";
                  imgWp.style.cssText = ele.cssText;
                  imgWp.setAttribute("data-type",ele.type);
                  imgWp.setAttribute("data-info",ele.info);
                  imgWp.appendChild(img);

                  this.addDiyElement($(imgWp),true);
              };

              // 装饰
              if("diy_decorate" == ele.type){
                  var img = document.createElement("img");
                  img.src = ele.src;

                  //下需要在mousedown取消默认操作;
                  $(img).mousedown(function(event){event.preventDefault();});
                  img.style.width = "100%";
                  img.style.height = "100%";

                  imgWp = document.createElement("div");
                  imgWp.className = "diyDecorate";
                  imgWp.style.cssText = ele.cssText;
                  imgWp.setAttribute("data-type",ele.type);
                  imgWp.setAttribute("data-info",ele.info);
                  imgWp.appendChild(img);

                  this.addDiyElement($(imgWp),true);
              };

              // 文本
              if("diy_text" == ele.type){

                      var p = document.createElement("p");
                      p.className = "divText";
                      p.innerHTML = ele.info;
                      p.style.cssText = ele.cssText;
                      p.setAttribute("data-type",ele.type);
                      p.setAttribute("data-info",ele.info);

                      this.addDiyElement($(p),true);
              };

              // 边框
              if("diy_frame" == ele.type){

                    var img = document.createElement("img");
                    img.src = ele.src;

                    $(img).mousedown(function(event){event.preventDefault();});//下需要在mousedown取消默认操作;
                    img.style.width = "100%";
                    img.style.height = "100%";

                    imgWp = document.createElement("div");
                    imgWp.className = "diyFrame";
                    imgWp.style.cssText = ele.cssText;
                    imgWp.setAttribute("data-type",ele.type);
                    imgWp.setAttribute("data-info",JSON.stringify(ele.info));
                    imgWp.appendChild(img);
                    this.addDiyElement($(imgWp),true);

                    if(ele.photo){
                        var photo = ele.photo;
                        var container = $(imgWp);
                        var frame_w = container.width();
                        var frame_h = container.height();

                        var infoData = ele.info;

                        var ratio = frame_w / infoData.sw; // 边框的缩放比例
                        var frame_in_w = infoData.w * ratio , frame_in_h = infoData.h * ratio; // 边框内图片可视区域大小

                        var img = document.createElement("img");
                        img.src = photo.src;

                        var frameRation = infoData.w / infoData.h; // 边框可视区域的宽高比
                        var imgSourceRatio = img.width / img.height; // 边框内图片的原始宽高比

                        if(imgSourceRatio > frameRation){
                            img.style.height = frame_in_h + "px";
                            img.style.width = frame_in_h * imgSourceRatio + "px";
                            img.style.left = -(frame_in_h * imgSourceRatio - frame_in_w)/2 + "px";
                        }else{
                            img.style.width = frame_in_w + "px";
                            img.style.height = frame_in_w / imgSourceRatio + "px";
                            img.style.top = -(frame_in_w / imgSourceRatio - frame_in_h)/2 + "px";
                        }
                        img.setAttribute("data-info",photo.info);

                        $(img).mousedown(function(event){event.preventDefault();});//下需要在mousedown取消默认操作;

                        // 添加框架内图片
                        var imgWp = document.createElement("div");
                        imgWp.className = "diyFramePhoto"
                        imgWp.style.left = infoData.x/infoData.sw * 100 + "%";
                        imgWp.style.top = infoData.y/infoData.sh * 100 + "%";
                        imgWp.style.width = infoData.w/infoData.sw * 100 + "%";
                        imgWp.style.height = infoData.h/infoData.sh * 100 + "%";
                        imgWp.appendChild(img);
                        container.prepend($(imgWp));
                        //添加历史记录
                        this.history.add("editFrame",container);

                    }

              };


              this.cancelEdit(); // 取消当前编辑状态

            }
        }





        //添加或移除框架内图片的缩放和拖动操作图标 参数：ele 框架的jQuery对象; action : edit || normal
        var diyFramePhotoEditToggle = (function(Manager){

            var larger = $('<a class="divFrameLarger" title="放大" src="javascript:void(0);">放大</a>');
            var smaller = $('<a class="divFrameSmaller" title="缩小" src="javascript:void(0);">缩小</a>');
            var moveEle = $('<a class="divFrameMove" title="拖动" src="javascript:void(0);">拖动</a>')[0];

            moveEle.onmousedown = function(event){//移动边框内的图片功能
                var $target = $(this);

                //框架内图片的移动功能
                var $target_parent = $target.parent();
                var diyFramePhoto = $target_parent.find("img")[0];

                // 拖动功能
                var dragging = true;
                var iX, iY;
                iX = event.clientX;
                iY = event.clientY;

                var diyFramePhotoStyle = diyFramePhoto.style;
                var sLeft = parseFloat(diyFramePhotoStyle.left);
                var sTop = parseFloat(diyFramePhotoStyle.top);

                $(document).on('mousemove.diyFramePhotoMove',function(event) {
                    if (dragging) {
                        var event = event || window.event;
                        var oX = event.clientX - iX;
                        var oY = event.clientY - iY;
                        diyFramePhotoStyle.left = sLeft + oX + "px";
                        diyFramePhotoStyle.top = sTop + oY + "px";
                        return false;
                    }
                });

                $(document).on('mouseup.diyFramePhotoMove',function(event) {
                    dragging = false;
                    event.cancelBubble = true;

                    //添加历史记录
                    Manager.history.add("editFrame",Manager.currentEdit);
                    
                    $(this).off('mousemove.diyFramePhotoMove');
                    $(this).off('mouseup.diyFramePhotoMove');
                });

                event.stopPropagation();
                return false;
            };

            return function(ele,action){
                var container = ele.find("div.diyFramePhoto");
                if(!container[0]){return false;}; //框架内没有图片

                if(action == "edit"){
                    container.append(larger).append(smaller)//.append(moveEle);
                    container[0].appendChild(moveEle);
                }else{
                    larger.remove(); smaller.remove(); //moveEle.remove();
                    var moveEleParent = moveEle.parentNode;
                    moveEleParent && moveEleParent.removeChild(moveEle);
                };
            }

        }(me));



        // 实例化一个历史记录对象
        this.history();

        // 图片再编辑功能
        me.container.on('click',function(event){
            var $target = $(event.target);
            var $target_parent = $target.parent();
            //没有点击到任何元素
            if($target.is("#diy_content") || $target.is(".diyBackground")){
                me.cancelEdit($target);
                return false;
            }
            //点击到文本
            if($target.is(".divText")){
                me.setEditText($target);
                return false;
            }

            //框架内图片的放大功能
            if($target.is(".divFrameLarger")){
                me.scaleDiyFramePhoto(6/5);
                return false;
            }

            //框架内图片的缩小功能
            if($target.is(".divFrameSmaller")){
                me.scaleDiyFramePhoto(5/6);
                return false;
            }

            // 点击到图片
            if($target_parent.is(".diyPhoto")){
                me.setEditPhoto($target_parent);
                return false;
            }
            // 点击到装饰
            if($target_parent.is(".diyDecorate")){
                me.setEditPhoto($target_parent);
                return false;
            }
            // 点击边框
            if($target_parent.is(".diyFrame")){
                me.setEditFrame($target_parent);
                return false;
            }
            // 点击边框内图片
            if($target_parent.is(".diyFramePhoto")){
                me.setEditFrame($target_parent.parent());
                return false;
            }

        });

    };






    