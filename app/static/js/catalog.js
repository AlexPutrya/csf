$(document).ready(function(){

	// активация по нажатию на группу
	$("body").on('click', '.list-group-item', function(e){
		//отменяем стандартное действие
		e.preventDefault();
		var clickedId = this.id.split('-');
		//проверяем чтоб нажатие было на группу
		if(clickedId[0] == 'group'){
			// удаляем со всех элементов класс активной кнопки и делаем активной другую
			$(".list-group-item").removeClass('active');
			$(this).addClass('active');
			// даем возможность создавать товары
			$('#product .btn-success').removeClass('disabled');

			var parametr = {
				id: clickedId[1]
			};
			//отправляем запрос id категории и получаем на страницу товары в категории
			$.getJSON("/products", parametr)
			.done(function(data, testStatus, jqXHR){
				refresh_product(data);
			});
		}
	});

	//создание группы/категории
	$("body").on('click', '.btn-success', function(e){
		e.preventDefault();
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
					$.getJSON("/category/create", parametr)
					.done(function(data, testStatus, jqXNR){
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
	  						</div>'
				show_modal(modal_data);
					// после клика  на "создать" проверяем введенные данные
					$("body").on('click', '#modal-create', function(e){
					e.preventDefault();
					e.stopPropagation();
					// получаем название, цену, и id категории к которой бдует отнесен товар
					var product_name = $("#product-name").val();
					var product_price = $("#product-price").val();
					var active_category = $(".active").attr('id').split('-');
					if(product_name == '' || product_price == ''){
						return false;
					}else{
						parametr = {
							product_name : product_name,
							product_price : product_price,
							category_id : active_category[1]
						}
						// формируем и отправляем запрос AJAX на создание товара в бд
						$.getJSON("product/create", parametr)
						.done(function(data, testStatus, jqXNR){
							close_modal();
							refresh_product(data);
						});
					}
				});
			}
		}
	});
	// редактирование группы
	$("body").on('click', '.edit', function(e){
		e.preventDefault();
		e.stopPropagation();
		var clickedId = this.id.split("-");
		// редактируем группу
		if(clickedId[1] == "group"){
			var text_parts = $('#' + clickedId[1] +'-' +clickedId[2]).text().split('\n');
			var replace_text = prompt("Измените название", text_parts[0].trim()).trim();
			if(replace_text != "" && replace_text != null){
				parametr = {
					category_id: clickedId[2],
					cat_name: replace_text
				}
				$.getJSON("/category/update", parametr)
				.done(function(data, testStatus, jqXNR){
					if(data['status'] == 'ok'){
						$('#'+ clickedId[1] + '-' + clickedId[2]).html(replace_text +
							'<div class="btn-group pull-right">\
							<button type="button"  id="edit-'+ clickedId[1] + '-' + clickedId[2] +'" class="btn-xs btn-info edit">Редактировать</button>\
							<button type="button" id="delete-' + clickedId[1] + '-' + clickedId[2]+'" class="btn-xs btn-danger delete">Удалить</button>\
							</div>'
						);
					}
				});
			}
		}
	});

	// удаление групы или товара
	$("body").on('click', '.delete', function(e){
		//убираем действие по умолчанию, и вызов обработчиков событи у родительских елементов
		e.preventDefault();
		e.stopPropagation();
		var clickedId = this.id.split("-");
		if(confirm("Вы точно хотите удалить элемент?")){
			// Удаление группы 
			if(clickedId[1] == "group"){
				parametr = {
					category_id : clickedId[2]
				}
				// отправляем скрипту id категории которую нужно удалить, убираем из DOM категорию
				$.getJSON("/category/delete", parametr)
				.done(function(data, testStatus,jqXNR){
					if (data['status'] == 'ok'){
						$("#" + clickedId[1] +"-"+clickedId[2]).hide('slow', function(){
							$("#" + clickedId[1] +"-"+clickedId[2]).remove();
						});
					}
					
				});
			// Удаление товара
			}else if(clickedId[1] == "product"){
				parametr = {
					product_id : clickedId[2]
				}
				// отправляем скрипту id товара который нужно удалить, убираем из DOM товар
				$.getJSON("/product/delete", parametr)
				.done(function(data, testStatus,jqXNR){
					if (data['status'] == 'ok'){
						$("#" + clickedId[1] +"-"+clickedId[2]).hide('slow', function(){
							$("#" + clickedId[1] +"-"+clickedId[2]).remove();
						});
					}
					
				});
			}
			
		}
	});
	// закрытие модального окна и возвращение к обычному варианту
	$("body").on('click', '#modal-close', function(e){
		e.preventDefault();
		e.stopPropagation();
		close_modal();
	});
	// спрятать модальное окно и удалить все динамически бобавленные елементы
	function close_modal(){
		$('#modal').css('display','none');
		$('#modal form').remove();
		$('#modal').append(
			'<form><div class="form-group">\
				<button type="submit" class="btn btn-default" id="modal-create">Создать</button>\
				<button type="submit" class="btn btn-default" id="modal-close">Закрыть</button>\
			</div></form>'
		);
	}
	// создать окно с контентом который будет добавлен в начало
	function show_modal(modal_data){
		$('#modal')
		.css('display','block')
		.animate({opacity: 1, top: '50%'}, 200);
		$('#modal form').prepend(modal_data);
	}
	// обновление колонки с товарами, из json данные должны прийти под ключем "products"
	function refresh_product(data){
		//удаляем все продукты из колонки
		$("#product .list-group-item").remove();
		// перебираем элементы и добавляем на страницу
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