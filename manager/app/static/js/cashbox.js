$(document).ready(function(){

    show_categories();
    reload();

    // Загрузка списка товаров в группе
	$("body").on('click', '.list-group-item', function(e){
		//отменяем стандартное действие
		e.preventDefault();
		e.stopPropagation();
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
                    $('#title-block').text("Товары");
                    $.each(data.products,function(key, product){
                        $(".category-box .list-group").append(
                        '<a href="#" class="list-group-item" id="product-'+ product.id +'">'+ product.name +'<span class="badge">'+ product.price +' грн.</span></a>'
                        );
                    });
                }
            });
        //добавляем товар в чек
		}else if(clickedId[0] == 'product'){
		    var id_receipt = $("#receipt_number").text();
            var modal_data =
                '<div class="form-group">\
                    <label>Количество</label>\
                    <input type="text" class="form-control" id="quantity">\
                </div>\
                <div class="form-group control">\
                    <button type="submit" class="btn btn-default" id="modal-add">Добавить</button>\
                    <button type="submit" class="btn btn-default" id="modal-close">Закрыть</button>\
                </div>';
            show_modal(modal_data, 300, 140);
            $("#modal-add").on("click", function(e){
                e.preventDefault();
                e.stopPropagation();
                var quantity = $("#quantity").val();
                if (quantity >0){
                    $.ajax({
                        url: '/receipt/'+id_receipt+'/product/'+clickedId[1]+'/quantity/'+quantity,
                        type: "POST",
                        success: function(){
                            close_modal();
                            reload();
                        }
                    });
    		    }
            });

		}
	});

	// изменяем количество штук товара
	$('body').on('click', '.edit-count', function(e){
	    e.preventDefault();
	    e.stopPropagation();
	    var clickedId = this.id;
        var id_receipt = $("#receipt_number").text();
        var modal_data =
            '<div class="form-group">\
                <label>Количество</label>\
                <input type="text" class="form-control" id="quantity">\
            </div>\
            <div class="form-group control">\
                <button type="submit" class="btn btn-default" id="modal-change">Изменить</button>\
                <button type="submit" class="btn btn-default" id="modal-close">Закрыть</button>\
            </div>';
        show_modal(modal_data, 300, 140);
	    // var quantity = prompt("Количество", '>1');
        $("#modal-change").on("click", function(e){
            e.preventDefault();
            e.stopPropagation();
            var quantity = $("#quantity").val();
            if (quantity > 0){
                $.ajax({
                    url: '/receipt/'+id_receipt+'/product/'+clickedId+'/quantity/'+quantity,
                    type: "PUT",
                    success: function(){
                        close_modal();
                        reload();
                    }
                });
            }
	    });
	});

    //удаление товара из чека
	$('body').on('click', '.delete', function(e){
	    e.preventDefault();
	    e.stopPropagation();
	    var clickedId = this.id;
	    var id_receipt = $("#receipt_number").text();
        $.ajax({
            url: '/receipt/'+id_receipt+'/product/'+clickedId,
            type: "DELETE",
            success: function(){
                reload();
            }
        });
	});

    // открытие кассы
    $("#open-cashbox").on('click',function(e){
	    e.preventDefault();
		e.stopPropagation();
		$.ajax({
		    url: '/cashbox/status',
		    type: 'POST',
		    success: function(){
		        reload();
		        show_categories();
		    }
		});
	});

    // закрытие кассы
	$("#close-cashbox").on('click', function(e){
	    e.preventDefault();
		e.stopPropagation();
		$.ajax({
		    url: '/cashbox/status',
		    type: 'PUT',
		    success: function(){
		        reload();
		        $("#receipt_id h4").remove();
		        $("#cash").text('');
		        $(".product")
		    }
		});
	});

    //пробиваем чек
    $("#commit-check").on('click', function(e){
	    e.preventDefault();
		e.stopPropagation();
		$.ajax({
		    url: '/receipt',
		    type: 'PUT',
		    success: function(){
		        reload();
		    }
		});
	});

	// при нажатии назад возвращает список категорий
	$("body").on('click', '#back', function(){
	    show_categories();
	    $('#title-block').text("Категории");
	});

    //перезагрузка данных на странице
	function reload(){
        $.ajax({
            url: '/receipt',
            type: "GET",
            success: function(data){
                //	касса закрыта и она пустая без элементов
                if (data.cashbox_status == 0){
                    $("#commit-check").addClass("disabled");
                    $("#close-cashbox").addClass("disabled");
                    $("#open-cashbox").removeClass("disabled");
                    $(".category-box .list-group-item").remove();
                    // очищаем список чека и список категорий и групп
                    $('.product').remove();
                    $(".category-box .list-group-item").remove();
                    $('#back').css('display','none');

                //	касса открыта
                }else if(data.cashbox_status == 1){
                    //очищаем список позиций чека и загружем новые данные если они есть
                    $('.product').remove();
                    $.each(data.receipt_products,function(key, product){
                        if((data.receipt_products).length == 0){
                            show_categories();
                        }
                        $("#product-list").append(
                            '<div class="row product">\
                                <div class="col-md-1">'+product.number+'</div>\
                                <div class="col-md-4">'+product.name+'</div>\
                                <div class="col-md-2">'+product.quantity+'шт</div>\
                                <div class="col-md-2">'+product.price+' грн.</div>\
                                <div class="col-md-2">'+product.summa+' грн.</div>\
                                <div class="col-md-1">\
                                    <a href="#" class="edit-count" id="'+product.product_id+'"> <span class="glyphicon glyphicon-pencil"></span></a>\
                                    <a href ="#" class="delete" id="'+product.product_id+'"> <span class="glyphicon glyphicon-remove"></span></a>\
                                </div>\
                            </div>\
                        ');
                    });
                    if(data.receipt_summ != 0){
                        //выводим сумму чека, общую сумму кассы
                        $('#product-list').append(
                        '<div class="row product">\
                                <div class="col-md-2 col-md-offset-7 text-success">Общая сумма:</div>\
                                <div class="col-md-2 text-success">'+data.receipt_summ+' грн</div>\
                            </div>\
                        ');
                    }
                    if(data.cash != 0){
                        $("#cash").text(data.cash+' грн.');
                    }
                    // удаляем и выводим новый заголовок с id чека, и делаем кнопки правильного статуса
                    $("#receipt_id h4").remove();
                    $("#receipt_id").append('<h4>Чек № <span id="receipt_number">'+data.id_receipt+'</span></h4>');
                    $("#commit-check").removeClass("disabled");
                    $("#close-cashbox").removeClass("disabled");
                    $("#open-cashbox").addClass("disabled");
                }
            }
        });
	}

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

    // Закрытие модального окна и возвращение к обычному варианту
	$("body").on('click', '#modal-close', function(e){
		e.preventDefault();
		e.stopPropagation();
		close_modal();
	});
});
