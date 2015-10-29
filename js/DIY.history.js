/*  
      历史记录管理器
        @@@一条历史记录对象：
        {
          "action":"edit || add || del || moveIndex || loadModul || clear",
          "data":{
            "ele": jQueryElement
            ,"type": "diy_background"
            ,"cssText": "width: 552px; height: 366px; top: 0px; left: 0px;"
            ,"info": "media/background/101s.jpg"
            ,"src": "media/background/101s.jpg"
          }
        }
        @@@
    */
    DIYManagerClass.prototype.history = function(){
		var history={};
		var me = this;

      	var historyLeft = []; // 存储undo(撤销)操作记录数组
      	var historyRight = []; // 存储redo(恢复)操作记录数组

        history._historyLeft = historyLeft; // 测试输出用， 到时要删除！！！！！！！！！！！！！！！！！！
        history._historyRight = historyRight; // 测试输出用， 到时要删除！！！！！！！！！！！！！！！！！！

      	// 添加到历史记录
		history.add = function(action,ele,moveIndexStep){

            if("moveIndex" === action){// 改变层叠顺序
                historyLeft.unshift({
                    "action" : action,
                    "ele" : ele,
                    "data" : {step:moveIndexStep||0}
                });
                return;
            } 

            if("editFrame" === action){ // 边框修改 包括边框移动缩放，边框内图片修改添加替换缩放移动
                var framePhoto = ele.find("div.diyFramePhoto>img")[0];
                if(framePhoto){ // 边框内有图片
                    var photoData = {
                        cssText : framePhoto.style.cssText,
                        src : framePhoto.getAttribute('src'),
                        info : framePhoto.getAttribute('data-info')
                    }
                    historyLeft.unshift({"action":action,"ele":ele,data:me.getDiyEleData(ele),photo:photoData});
                }else{
                    historyLeft.unshift({"action":action,"ele":ele,data:me.getDiyEleData(ele)});
                };

                historyRight.length = 0;

                // console.group("---- add history ----")
                // console.info(historyLeft)
                // console.info(historyRight)
                // console.groupEnd()

                return;
            }

	        historyLeft.unshift({"action":action,"ele":ele,data:me.getDiyEleData(ele,true)});
	        if("del" === action){historyLeft.unshift(historyLeft[0]);} // 删除时再添加一条记录

            historyRight.length = 0; // 清除可redo的记录

            // console.group("---- add history ----")
            // console.info(historyLeft)
            // console.info(historyRight)
            // console.groupEnd()

		}

		// 移除历史记录
		history.remove = function(){

		}

        // 返回历史记录中某元素的最近上一条历史记录对象
        history.findNearest = function(ele,action){
            var action = action || false;
            for(var i = 0, j = historyLeft.length; i < j; i++){
                if(ele[0] == historyLeft[i].ele[0]){
                    if(action){
                        if(action == historyLeft[i].action){return historyLeft[i];}
                    }else{
                        return historyLeft[i];
                    }
                }
            };
            return false;
        }

		// 转到某条历史记录
		history.go = function(num){
			if( -1 === num){ // 撤销 undo
                if(historyLeft.length == 0){return}; // 没有历史记录返回
                var preHistory = historyLeft.shift();
                historyRight.unshift(preHistory);

                // 找回历史记录中同一元素被上一次记录
                var nowHistory = this.findNearest(preHistory.ele);

                switch(nowHistory && nowHistory.action){
                    case "add": // 撤销添加
                        var ele = nowHistory.ele;
                        me.delDiyElement(ele,false);
                        historyRight.unshift(historyLeft.shift()); // 添加元素的时候有发生两条记录,所以要再移一条记录
                        break;
                    case "edit": // 撤销修改
                        var ele = nowHistory.ele;
                        ele[0].style.cssText = nowHistory.data.cssText;
                        if(ele.hasClass("diyBackground")){ele[0].src = nowHistory.data.info; return;}// 背景图片
                        if(ele.hasClass("divText")){ele.html(nowHistory.data.info);}// 文本类型
                        if(ele.hasClass("diyFrame")){ele.find('div.diyFramePhoto>img').remove();}// 边框
                        me.setElememtEdit(ele);
                        break;
                    case "del" : // 撤销删除
                        var ele = nowHistory.ele;
                        me.addDiyElement(ele,true,false); // 添加回画布
                        historyRight.unshift(historyLeft.shift());  // 删除元素的时候有发生两条记录,所以要再移一条记录
                        me.setElememtEdit(ele);
                        break;
                    case "moveIndex" : // 撤销层顺序修改
                        var ele = nowHistory.ele;
                        me.moveIndex(-nowHistory.data.step,ele,true,false);
                        historyRight.unshift(historyLeft.shift()); // 改变层叠的时候有发生两条记录,所以要再移一条记录
                        break;
                    case "editFrame": // 修改边框内
                        var ele = nowHistory.ele;
                        var diyFramePhoto = ele.find('div.diyFramePhoto>img')[0];
                        var historyData = nowHistory.data;
                        ele[0].style.cssText = historyData.cssText; // 边框属性设置

                        if(diyFramePhoto && nowHistory.photo){
                            var photoData = nowHistory.photo;
                            diyFramePhoto.style.cssText = photoData.cssText;
                            diyFramePhoto.src = photoData.src;
                            diyFramePhoto.setAttribute("data-info",photoData.info);
                        }else{
                            if(diyFramePhoto){diyFramePhoto.parentNode.removeChild(diyFramePhoto)};
                        }

                        me.setElememtEdit(ele);
                        break;
                    case "loadModul": // 撤销加载模版
                        break;
                    case "clear": // 撤销清空画布
                        break;
                }
                
                // console.group("---- undo ----")
                // console.info(historyLeft)
                // console.info(historyRight)
                // console.groupEnd()

            };
            
            if( 1 === num){ // 恢复 redo
                if(historyRight.length == 0){return}; // 没有历史记录返回
                var nextHistory = historyRight.shift();
                historyLeft.unshift(nextHistory);


                var nowHistory = historyLeft[0];

                if("add" === nextHistory.action){nowHistory = nextHistory;}

                switch(nowHistory.action){
                    case "add": // 撤销添加
                        var ele = nowHistory.ele;
                        me.addDiyElement(ele,true,false); // 添加回画布
                        historyLeft.unshift(historyRight.shift());// 添加元素的时候有发生两条记录,所以要再移一条记录
                        break;
                    case "edit": // 撤销修改
                        var ele = nowHistory.ele;
                        ele[0].style.cssText = nowHistory.data.cssText;
                        if(ele.hasClass("diyBackground")){ele[0].src = nowHistory.data.info; return;}// 背景图片
                        if(ele.hasClass("divText")){ele.html(nowHistory.data.info);}// 文本类型
                        
                        me.setElememtEdit(ele);
                        break;
                    case "del" : // 撤销删除
                        var ele = nowHistory.ele;
                        me.delDiyElement(ele,false);
                        historyLeft.unshift(historyRight.shift());  // 删除元素的时候有发生两条记录,所以要再移一条记录
                        break;
                    case "moveIndex" : // 撤销层顺序修改
                        var ele = nowHistory.ele;
                        me.moveIndex(nowHistory.data.step,ele,true,false);
                        historyLeft.unshift(historyRight.shift()); // 改变层叠的时候有发生两条记录,所以要再移一条记录
                        break;
                    case "addFramePhoto" : // 返回添加边框图片
                        var ele = nowHistory.ele;
                        var diyFramePhoto = ele.find('div.diyFramePhoto')[0];
                        var img = document.createElement("img");
                        img.src = nowHistory.data.src;
                        img.style.cssText = nowHistory.data.cssText;
                        img.setAttribute("data-info",nowHistory.data.info);
                        diyFramePhoto.appendChild(img);
                        historyLeft.unshift(historyRight.shift()); // 改变层叠的时候有发生两条记录,所以要再移一条记录
                        me.setElememtEdit(ele);
                        break;           
                    case "editFrame" : // 撤销层顺序修改
                        var ele = nowHistory.ele;
                        var diyFramePhoto = ele.find('div.diyFramePhoto>img')[0];
                        var historyData = nowHistory.data;
                        ele[0].style.cssText = historyData.cssText; // 边框属性设置

                        if(nowHistory.photo){
                            if(!diyFramePhoto){
                                diyFramePhoto = document.createElement("img");
                                ele.find('div.diyFramePhoto')[0].appendChild(diyFramePhoto);
                            }
                            var photoData = nowHistory.photo;
                            diyFramePhoto.style.cssText = photoData.cssText;
                            diyFramePhoto.src = photoData.src;
                            diyFramePhoto.setAttribute("data-info",photoData.info);
                        }else{
                            if(diyFramePhoto){diyFramePhoto.parentNode.removeChild(diyFramePhoto)};
                        }

                        me.setElememtEdit(ele);
                        break;
                    case "loadModul": // 撤销加载模版
                        break;
                    case "clear": // 撤销清空画布
                        break;
                }

                // console.group("---- redo ----")
                // console.info(historyLeft)
                // console.info(historyRight)
                // console.groupEnd()

            };
		}

		// 返回上一条历史记录
		history.back = function(){
			this.go(-1);
		}

		// 前进上一条历史记录
		history.forward = function(){
			this.go(1);
		}

		this.history = history;

    };