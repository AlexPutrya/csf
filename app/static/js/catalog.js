// Доделать чтоб при удалении каталога удалялись все товары из него
$(document).ready(function(){
	$()
	// Загрузка списка товаров в группе
	$("body").on('click', '.list-group-item', function(e){
		//отменяем стандартное действие
		e.preventDefault();
		var clickedId = this.id.split('-');
		//проверяем чтоб нажатие было на группу
		if(clickedId[0] == 'group'){
			// удаляем со всех элементов класс активной кнопки и делаем активной другую
			$(".list-group-item").removeClass('active');
			$(this).addClass('active');
			// когда категория выбрана, даем возможность создавать товары
			$('#product .btn-success').removeClass('disabled');
            // запрашиваем список категорий и отрисовываем их
            $.ajax({
                url: '/categories/'+clickedId[1]+'/products',
                type: "GET",
                success: function(data){
                    refresh_product(data);
                }
            });
		}
	});

	//Создание группы или товара
	$("body").on('click', '.btn-success', function(e){
		e.preventDefault();
		e.stopPropagation();
		var clickedId = this.id.split('-')
		if(clickedId[0] == 'create'){
			//Создание группы
			if(clickedId[1] == 'group'){
				//запрашиваем название проверяем чтоб не ввели пустое
				var name = prompt("Название группы:", "");
				if(name != null && name != ''){
					var parametr = {
						category_name: name
					}
					//отправляем запрос, получаем полный список категорий, удаляем старые выводим новые
					$.ajax({
					    url: '/categories',
					    type: 'POST',
					    data: parametr,
					    success: function(data){
					        $("#group .list-group-item").remove();
                            $.each(data.category, function(key, value){
                                $("#group .list-group").append(
                                    '<a href="#" class="list-group-item" id="group-'+value.id+'">'+value.name+
                                    '\n<div class="btn-group pull-right">\
                                        <button type="button" id="edit-group-'+value.id+'" class="btn-xs btn-info edit">Редактировать</button>\
                                        <button type="button" id="delete-group-'+value.id+'" class="btn-xs btn-danger delete">Удалить</button>\
                                    </div></a>'
                                );
                            });
					    }
					});
				}
			// Создание товара
			}else if(clickedId[1] == 'product'){
				// выводим модальное окно и добавляем два инпута имя и цену
				modal_data ='<div class="form-group">\
	    						<label>Название товара</label>\
	    						<input type="text" class="form-control" id="product-name">\
	  						</div>\
	  						<div class="form-group">\
	    						<label>Цена, грн.</label>\
	    						<input type="text" class="form-control" id="product-price">\
	  						</div>\
	  						<div class="form-group">\
								<button type="submit" class="btn btn-default" id="modal-create">Создать</button>\
								<button type="submit" class="btn btn-default" id="modal-close">Закрыть</button>\
							</div>';
				show_modal(modal_data);
					// после клика  на "создать" проверяем введенные данные
				$('#modal-create').click(function(e){
					e.preventDefault();
					e.stopPropagation();
					// получаем название, цену, и id категории к которой будет отнесен товар
					var product_name = $("#product-name").val();
					var product_price = $("#product-price").val();
					var active_category = $(".list-group-item.active").attr('id').split('-');
					if(product_name == '' || product_price == ''){
						return false;
					}else{
						parametr = {
							product_name : product_name,
							product_price : product_price
						}
						// формируем и отправляем запрос AJAX на создание товара в бд
						$.ajax({
						    url: 'categories/'+active_category[1]+'/products',
						    type: "POST",
						    data: parametr,
						    success: function(data){
						        close_modal();
							    refresh_product(data);
						    }
						});
					}
				});
			}
		}
	});
	// Редактирование группы
	$("body").on('click', '.edit', function(e){
		e.preventDefault();
		e.stopPropagation();
		var clickedId = this.id.split("-");
		// редактируем группу
		if(clickedId[1] == "group"){
			var text_parts = $('#' + clickedId[1] +'-' +clickedId[2]).text().split('\n');
			var replace_text = prompt("Измените название", text_parts[0].trim()).trim();
			var id_category = clickedId[2]
			if(replace_text != "" && replace_text != null){
				parametr = {
					category_name: replace_text
				}
				$.ajax({
                    url: '/categories/'+id_category,
                    type: 'PUT',
                    data: parametr,
                    success: function(data){
                        $('#'+ clickedId[1] + '-' + clickedId[2]).html(replace_text +
                        '<div class="btn-group pull-right">\
                        <button type="button"  id="edit-'+ clickedId[1] + '-' + clickedId[2] +'" class="btn-xs btn-info edit">Редактировать</button>\
                        <button type="button" id="delete-' + clickedId[1] + '-' + clickedId[2]+'" class="btn-xs btn-danger delete">Удалить</button>\
                        </div>'
                        );
                    }
				});
			}
        //редактируем товар
		}else if(clickedId[1] == "product"){
			var text_parts = $('#' + clickedId[1] +'-' +clickedId[2]).text().split(' ');
			modal_data ='<div class="form-group">\
    						<label>Название товара</label>\
    						<input type="text" class="form-control" id="product-name" value="'+text_parts[0]+'">\
  						</div>\
  						<div class="form-group">\
    						<label>Цена, грн.</label>\
    						<input type="text" class="form-control" id="product-price" value="'+text_parts[2]+'">\
  						</div>\
  						<div class="form-group">\
							<button type="submit" class="btn btn-default" id="modal-edit">Редактировать</button>\
							<button type="submit" class="btn btn-default" id="modal-close">Закрыть</button>\
						</div>';
  			show_modal(modal_data);
  			$("#modal-edit").click(function(e){
  				e.preventDefault();
  				e.stopPropagation();
  				var product_name = $("#product-name").val();
				var product_price = $("#product-price").val();
				var id_product = clickedId[2];
				if(product_name == '' || product_price == ''){
					return false;
				}else{
					parametr = {
						product_name : product_name,
						product_price : product_price,
					}
					// формируем и отправляем запрос AJAX на редактирвоание товара
					$.ajax({
					    url: '/products/'+id_product,
					    type: 'PUT',
					    data: parametr,
					    success: function(data){
					        close_modal();
					        $('#'+ clickedId[1] + '-' + clickedId[2]).html(product_name +'<span class=" price"> | ' + product_price + ' грн</span>\
								<div class="btn-group pull-right">\
								<button type="button"  id="edit-'+ clickedId[1] + '-' + clickedId[2] +'" class="btn-xs btn-info edit">Редактировать</button>\
								<button type="button" id="delete-' + clickedId[1] + '-' + clickedId[2]+'" class="btn-xs btn-danger delete">Удалить</button>\
								</div>'
							);
					    }

					});
				}
  			});
		}
	});

	// Удаление групы или товара
	$("body").on('click', '.delete', function(e){
		//убираем действие по умолчанию, и вызов обработчиков событи у родительских елементов
		e.preventDefault();
		e.stopPropagation();
		var clickedId = this.id.split("-");
		if(confirm("Вы точно хотите удалить элемент?")){
		    var id_category = clickedId[2]
			// Удаление группы
			if(clickedId[1] == "group"){
				// отправляем скрипту id категории которую нужно удалить, убираем из DOM категорию
				$.ajax({
                    url: '/categories/'+id_category,
                    type: 'DELETE',
                    success: function(data){
                        $("#" + clickedId[1] +"-"+clickedId[2]).hide('slow', function(){
							$("#" + clickedId[1] +"-"+clickedId[2]).remove();
						});
                    }
				});
			// Удаление товара
			}else if(clickedId[1] == "product"){
			    var id_product = clickedId[2]
				// отправляем скрипту id товара который нужно удалить, убираем из DOM товар
                $.ajax({
                    url: '/products/'+id_product,
                    type: 'DELETE',
                    success: function(){
                        $("#" + clickedId[1] +"-"+clickedId[2]).hide('slow', function(){
							$("#" + clickedId[1] +"-"+clickedId[2]).remove();
						});
                    }
                });
			}

		}
	});
	// Закрытие модального окна и возвращение к обычному варианту
	$("body").on('click', '#modal-close', function(e){
		e.preventDefault();
		e.stopPropagation();
		close_modal();
	});
	// Спрятать модальное окно и удалить все динамически добавленные елементы
	function close_modal(){
		$('#modal').css('display','none');
		$('#modal form').remove();
		$('#modal').append(
			'<form></form>'
		);
	}
	// Cоздать окно с контентом который будет добавлен в начало
	function show_modal(modal_data){
		$('#modal')
		.css('display','block')
		.animate({opacity: 1, top: '50%'}, 200);
		$('#modal form').prepend(modal_data);
	}
	// Обновление колонки с товарами, из json данные должны прийти под ключем "products"
	function refresh_product(data){
		//удаляем все продукты из колонки
		$("#product .list-group-item").remove();
		// перебираем элементы товаров и добавляем на страницу
		$.each(data.products, function(key, value) {
			$("#product .list-group").append(
				'<a href="#" class="list-group-item" id="product-'+value.id+'">'+value.name+'<span class=" price"> | '+value.price+' грн</span>\
				<div class="btn-group pull-right">\
					<button type="button"  id="edit-product-'+value.id+'" class="btn-xs btn-info edit">Редактировать</button> \
					<button type="button" id="delete-product-'+value.id+'" class="btn-xs btn-danger delete">Удалить</button>\
					</div></a>'
			);
		});
	}
});
