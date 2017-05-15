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
			$.ajax({
                url: '/categories/'+clickedId[1]+'/products',
                type: "GET",
                success: function(data){
                    //очищаем группы для загрузки товаров
                    $(".category-box .list-group-item").remove();
                    // выводим кнопку возврата к категориям
                    $('#back').css('display','block');
                    $.each(data.products,function(key, product){
                        $(".category-box .list-group").append(
                        '<a href="#" class="list-group-item" id="product-'+ product.id +'">'+ product.name +'<span class="badge">'+ product.price +' грн.</span></a>'
                        );
                    });
                }
            });
		}
	});

    // при нажатии назад возвращает список категорий
	$("body").on('click', '#back', function(){
	    show_categories();
	});

    // открытие кассы
	$("#open-cashbox").click(function(e){
	    e.preventDefault();
		e.stopPropagation();
	    $.getJSON("/cashbox/open")
		.done(function(data, testStatus, jqXHR){
            reload();
        });
	});

    // закрытие кассы
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
	    $.ajax({
	        url: '/categories',
	        type: 'GET',
	        success: function(data){
	            //очищаем группы для загрузки товаров
			    $(".category-box .list-group-item").remove();
			    // прячем кнопку возврата к категориям
                $('#back').css('display','none');
                $.each(data.category,function(key, cat){
                    $(".category-box .list-group").append(
                    '<a href="#" class="list-group-item" id="group-'+ cat.id +'">'+ cat.name +'</a>'
                    );
                });
	        }
	    });
	}
    //перезагрузка данных на странице
	function reload(){
	    // после загрузки страницы отрисовываем группы в блоке
        show_categories();
        $.ajax({
            url: '/receipt',
            type: "GET",
            success: function(data){
                //	касса закрыта и она пустая без элементов
                if (data.cashbox_status == 0){
                    $("#commit-check").addClass("disabled");
                    $("#close-cashbox").addClass("disabled");
                    $("#open-cashbox").removeClass("disabled");
                //	касса открыта
                }else if(data.cashbox_status == 1){
                    $('.product').remove();
                    $.each(data.receipt_products,function(key, product){
                        $("#product-list").append(
                            '<div class="row product">\
                                <div class="col-md-1">'+product.number+'</div>\
                                <div class="col-md-5">'+product.name+'</div>\
                                <div class="col-md-2">'+product.quantity+'шт</div>\
                                <div class="col-md-2">'+product.price+' грн</div>\
                                <div class="col-md-2">'+product.summa+' грн</div>\
                            </div>\
                        ');
                    });
                    $('#product-list').append(
                    '<div class="row product">\
							<div class="col-md-2 col-md-offset-8">Сумма чека:</div>\
							<div class="col-md-2">'+data.receipt_summ+' грн</div>\
						</div>\
                    ');
                    $("#commit-check").removeClass("disabled");
                    $("#close-cashbox").removeClass("disabled");
                    $("#open-cashbox").addClass("disabled");
                }
            }
        });
	}
});