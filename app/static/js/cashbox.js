$(document).ready(function(){

    reload();

    // Загрузка списка товаров в группе
	$("body").on('click', '.list-group-item', function(e){
		//отменяем стандартное действие
		e.preventDefault();
		var clickedId = this.id.split('-');
		//проверяем чтоб нажатие было на группу
		if(clickedId[0] == 'group'){
			var parametr = {
				id: clickedId[1]
			};
			//отправляем запрос id категории и получаем на страницу товары в категории
			$.getJSON("/products", parametr)
			.done(function(data, testStatus, jqXHR){
                //очищаем группы для загрузки товаров
			    $(".category-box .list-group-item").remove();
			    // выводим кнопку возврата к категориям
                $('#back').css('display','block');
                $.each(data.products,function(key, product){
                    $(".category-box .list-group").append(
                    '<a href="#" class="list-group-item" id="product-'+ product.id +'">'+ product.name +'<span class="badge">'+ product.price +' грн.</span></a>'
                    );
                });

			});
		}
	});

    // при нажатии назад возвращает список категорий
	$("body").on('click', '#back', function(){
	    show_categories();
	});

	$("#open-cashbox").click(function(e){
	    e.preventDefault();
		e.stopPropagation();
	    $.getJSON("/cashbox/open")
		.done(function(data, testStatus, jqXHR){
            reload();
        });
	});

	$("#close-cashbox").click(function(e){
	    e.preventDefault();
		e.stopPropagation();
	    $.getJSON("/cashbox/close")
		.done(function(data, testStatus, jqXHR){
            reload();
        });
	});



    // делает запрос скрипту и отрисовывает список категорий
	function show_categories(){
	    $.getJSON("/categories")
			.done(function(data, testStatus, jqXHR){
                //очищаем группы для загрузки товаров
			    $(".category-box .list-group-item").remove();
			    // прячем кнопку возврата к категориям
                $('#back').css('display','none');
                $.each(data.category,function(key, cat){
                    $(".category-box .list-group").append(
                    '<a href="#" class="list-group-item" id="group-'+ cat.id +'">'+ cat.name +'</a>'
                    );
                });
			});
	}

	function reload(){
	    // после загрузки страницы отрисовываем группы в блоке
        show_categories();
        $.getJSON("/cashbox/sales")
        .done(function(data, testStatus, jqXHR){
            //	касса закрыта и она пустая без элементов
            if (data.cashbox_status == 0){
                $("#commit-check").addClass("disabled");
                $("#close-cashbox").addClass("disabled");
                $("#open-cashbox").removeClass("disabled");
            //	касса открыта
            }else if(data.cashbox_status == 1){
                $("#commit-check").removeClass("disabled");
                $("#close-cashbox").removeClass("disabled");
                $("#open-cashbox").addClass("disabled");
            }
	    });
	}
});