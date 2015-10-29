/* Js Explain.
*  Author:Richard.Z
*  Blog:http://www.zmq.cc
*  Microblogging:http://weibo.com/v3u3i87
*  E_mail:office@zmq.cc
*  Client:Red eggs Network Technology Co., Ltd. Site:http://www.yinkewang.com
*/

function initMenu() {
  $('#menu ul').hide();
  $('#menu ul:first').show();
  $('#menu li a').click(
    function() {
      var checkElement = $(this).next();
      if((checkElement.is('ul')) && (checkElement.is(':visible'))) {
        return false;
      }
      if((checkElement.is('ul')) && (!checkElement.is(':visible'))) {
        $('#menu ul:visible').slideUp('normal');
        checkElement.slideDown('normal');
        return false;
      }
    }
  );

  
  $(window).on("resize load",function(){
    $('#menu .diy_img_abc').height($(document).height()-230);
    $('#diy_container').height($(document).height()-34);
  });


};


$(document).ready(function() {
    initMenu();
});