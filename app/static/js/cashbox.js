$(document).ready(function(){
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

	$("body").on('click', '#back', function(){
	    var parametr = {
	        category : true
	    };
        $.getJSON("/cashbox", parametr)
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
	});
});