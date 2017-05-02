$(document).ready(function(){

		// активация по нажатию на группу
		$("body").on('click', '.list-group-item', function(e){
			//отменяем стандартное действие
			e.preventDefault();
			var clickedId = this.id.split('-');
			//проверяем чтоб нажатие было на группу
			if(clickedId[0] == 'group'){
				$(".list-group-item").removeClass('active');
				$(this).addClass('active')

				var parametr = {
					id: clickedId[1]
				};
				//отправляем запрос id категории и получаем на страницу товары в категории
				$.getJSON("/products", parametr)
				.done(function(data, testStatus, jqXHR){
					//удаляем все продукты из колонки
					$("#product .list-group-item").remove();
					// перебираем элементы и добавляем на страницу
					$.each(data.products, function(key, value) {
						$("#product .list-group").append('<a href="#" class="list-group-item" id="product-'+value.id+'">'+value.name+'<span class=" price"> | 80грн</span><div class="btn-group pull-right"><button type="button"  id="edit-product-'+value.id+'" class="btn-xs btn-info edit">Редактировать</button><button type="button" id="delete-product-'+value.id+'" class="btn-xs btn-danger delete">Удалить</button></div></a>'
						);
					});
				});
			}
		});

		//создание группы/категории
		$("body").on('click', '.btn-success', function(e){
			e.preventDefault();
			var clickedId = this.id.split('-')
			if(clickedId[0] == 'create'){
				//проверяем если нажата кнопка создания для группы
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
							    $("#group .list-group").append('<a href="#" class="list-group-item" id="group-'+value.id+'">'+value.name+'\n<div class="btn-group pull-right"><button type="button"  id="edit-group-'+value.id+'" class="btn-xs btn-info edit">Редактировать</button> <button type="button" id="delete-group-'+value.id+'" class="btn-xs btn-danger delete">Удалить</button></div></a>');
							});
						});
					}
				}else if(clickedId[1] == 'product'){
					var name = prompt("Название товара:", "");
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
							$('#'+ clickedId[1] + '-' + clickedId[2]).html(replace_text + '<div class="btn-group pull-right"> <button type="button"  id="edit-'+ clickedId[1] + '-' + clickedId[2] +'" class="btn-xs btn-info edit">Редактировать</button> <button type="button" id="delete-' + clickedId[1] + '-' + clickedId[2]+'" class="btn-xs btn-danger delete">Удалить</button></div>');
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
				}
				
			}
		});
	});