$(document).ready(function(){
  // проверяем чтоб были не пустыми поля перед отправкой
  $("#submit").click(function(e){
    var name = $("input[name='login']").val();
    var password = $("input[name='password']").val();
      if(name && password){
        return true;
      }else{
        if(password == "" && name == ""){
          $("input[name='password']").parent().addClass("has-error");
          $("input[name='login']").parent().addClass("has-error");
        }else if(password == ""){
          $("input[name='password']").parent().addClass("has-error");
        }else if (name == "") {
          $("input[name='login']").parent().addClass("has-error");
        }
        return false;
      }
  });

  // при нажатии в форму убираем красный цвет
  $("input").focus(function(){
    $(this).parent().removeClass("has-error");
  });

});
