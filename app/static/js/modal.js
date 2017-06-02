// Спрятать модальное окно и удалить все динамически добавленные елементы
function close_modal(){
  $('#modal').css('display','none');
  $('#layer').css({display:'none'})
  $('#modal form').remove();
  $('#modal').append(
    '<form></form>'
  );
}
// Cоздать окно с контентом который будет добавлен в начало
function show_modal(modal_data, m_width, m_height){
  $('#modal')
  .css({display:'block',
        'width': m_width+"px",
        'height': m_height+'px',
        'margin-top': '-'+m_height/2+'px',
        'margin-left': '-'+m_width/2+'px'})
  .animate({opacity: 1, top: '50%'}, 200);

  $('#layer')
  .css({display:'block'})
  $('#modal form').prepend(modal_data);
}
