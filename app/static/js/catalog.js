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
				$.getJSON("/dishes", parametr)
				.done(function(data, testStatus, jqXHR){
					//удаляем все продукты из колонки
					$("#dish .list-group-item").remove();
					// перебираем элементы и добавляем на страницу
					$.each(data.products, function(key, value) {
						$("#dish .list-group").append('<a href="#" class="list-group-item" id="dish-'+value.id+'">'+value.name+'<span class=" price"> | 80грн</span><div class="btn-group pull-right"><button type="button"  id="edit-dish-'+value.id+'" class="btn-xs btn-info edit">Редактировать</button><button type="button" id="delete-dish-'+value.id+'" class="btn-xs btn-danger delete">Удалить</button></div></a>'
						);
					});
				});
			}
		});
//		//создание группы
//		$("body").on('click', '.btn-success', function(e){
//			e.preventDefault();
//			var clickedId = this.id.split('-')
//			if(clickedId[0] == 'create'){
//				var name = prompt("Название:", "");
//				if(name != null && name != ''){
//					$("#" + clickedId[1] + " .list-group").append('<a href="#" class="list-group-item" id="' + clickedId[1] + '-3">' + name +'<span class="badge delete" id="delete-' + clickedId[1] + '-3"> Удалить</span><span class="badge edit" id="edit-' + clickedId[1] + '-3"> Редактировать</span></a>');
//				}
//			}
//		})


		//создание группы
		$("body").on('click', '.btn-success', function(e){
			e.preventDefault();
			var clickedId = this.id.split('-')
			if(clickedId[0] == 'create'){
				var name = prompt("Название:", "");
				if(name != null && name != ''){
					//проверяем если группа
					if(clickedId[1] == 'group'){
						var parametr = {
							category_name: name
						}
						$.getJSON("/category/create", parametr)
						.done(function(data, testStatus, jqXNR){
							$("#group .list-group-item").remove();
							$.each(data.category, function(key, value){
							    $("#group .list-group").append('<a href="#" class="list-group-item" id="group-'+value.id+'">'+value.name+'<div class="btn-group pull-right"><button type="button"  id="edit-group-'+value.id+'" class="btn-xs btn-info edit">Редактировать</button> <button type="button" id="delete-group-'+value.id+'" class="btn-xs btn-danger delete">Удалить</button></div></a>');
							});
						});
					}
				}
			}
		});
		// редактирование группы
		$("body").on('click', '.edit', function(e){
			e.preventDefault();
			var clickedId = this.id.split("-");
			var text_parts = $('#' + clickedId[1] +'-' +clickedId[2]).text().split('\n');
			var replace_text = prompt("Измените текст", text_parts[0].trim()).trim();
			if(replace_text != "" && replace_text != null){
				$('#'+ clickedId[1] + '-' + clickedId[2]).html(replace_text + '<div class="btn-group pull-right"> <button type="button"  id="edit-'+ clickedId[1] + '-' + clickedId[2] +'" class="btn-xs btn-info edit">Редактировать</button> <button type="button" id="delete-' + clickedId[1] + '-' + clickedId[2]+'" class="btn-xs btn-danger delete">Удалить</button></div>');
			}
		});

		// удаление групы
		$("body").on('click', '.delete', function(e){
			e.preventDefault();
			var clickedId = this.id.split("-");
			if(confirm("Вы точно хотите удалить ?")){
				$("#" + clickedId[1] +"-"+clickedId[2]).hide('slow');
			}
		});
	});