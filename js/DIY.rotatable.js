/*
 * DIY.rotatable 0.1
 * Copyright (c) 2013 zsk526@qq.com
 * Date: 2013-01-09
 * 在DIY元素添加旋转功能

(function($){
    $.fn.diyRotatable = function(options){
        var defaults = {
            evenRowClass:"evenRow",
            oddRowClass:"oddRow",
            activeRowClass:"activeRow"            
        }
        var options = $.extend(defaults, options);
        this.each(function(){
            var oThis=$(this);

            oThis.append(handle);

            var top = oThis.offset().top;
            var left = oThis.offset().left;
            handle.css({top:-50,left:50})

        });
    };
})(jQuery);

 */







        //添加或移除框架内图片的缩放和拖动操作图标 参数：ele 框架的jQuery对象; action : edit || normal
        var diyRotatable = (function(Manager){

            var rotateHandle = $("<div id='rotateHandle'></div>");

            rotateHandle[0].onmousedown = function(event){//移动边框内的图片功能
                var $target = $(this);
                //框架内图片的移动功能
                var $target_parent = $target.parent();
                var parentOffset = $target_parent.offset();
                var parentWidth = $target_parent.width();
                var parentHeight = $target_parent.height();

                var sX = parentOffset.left + parentWidth/2;
                var sY = parentOffset.top + parentHeight/2;


                // 拖动功能
                var rotating = true;
                var iX, iY;
                iX = event.clientX;
                iY = event.clientY;

                $(document).on('mousemove.diyRotate',function(event) {
                    if (rotating) {
                        var event = event || window.event;
                        var oX = event.clientX - sX;
                        var oY = event.clientY - sY;
                        
                        if(oY < 0){var degree = 360 - Math.atan(oX/oY)*180/Math.PI;}
                        if(oY > 0){var degree = 180 - Math.atan(oX/oY)*180/Math.PI;}
                        if(degree > 360){degree -= 360};
                        $target_parent.css("-webkit-transform","rotate("+ degree +"deg)")
                        $target_parent.css("-moz-transform","rotate("+ degree +"deg)")
                        $target_parent.css("transform","rotate("+ degree +"deg)")

                        return false;
                    }
                });

                $(document).on('mouseup.diyRotate',function(event) {
                    rotating = false;
                    event.cancelBubble = true;

                    //添加历史记录
                    //Manager.history.add("editFrame",Manager.currentEdit);
                    
                    $(this).off('mousemove.diyRotate');
                    $(this).off('mouseup.diyRotate');
                });

                event.stopPropagation();
                return false;
            };

            return function(ele,action){
                if(action == "rotate"){
                    ele.append(rotateHandle);
                }else{
                    rotateHandle.remove();
                };
            }

        }());