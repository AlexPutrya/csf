$(document).ready(function(){
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth()+1;
  var backgroundColor = [
    'rgba(255,102,51,1)',
    'rgba(255,102,153,1)',
    'rgba(204,153,255,1)',
    'rgba(153,153,204,1)',
    'rgba(102,153,255,1)',
    'rgba(153,255,204,1)',
    'rgba(102,255,153,1)',
    'rgba(204,255,204,1)',
    'rgba(153,204,204,1)',
    'rgba(153,102,204,1)',
    'rgba(255,153,0,1)',
    'rgba(255,153,102,1)',
  ];
  //выводим статитстику за предидущий год и за текущий месяц
  statistic_month(year, month);
  statistic_year(year-1);
  statistic_product();


  // инициализация графика по месяцам
  var month = document.getElementById("monthChart");
  month.height = 130;
  var monthChart = new Chart(month, {
      type: 'line',
      data: {
          labels: [],
          datasets: [
              {
                  label: "Сумма, грн.",
                  fill: false,
                  lineTension: 0.1,
                  backgroundColor: "rgba(75,192,192,0.4)",
                  borderColor: "rgba(75,192,192,1)",
                  borderCapStyle: 'butt',
                  borderDash: [],
                  borderDashOffset: 0.0,
                  borderJoinStyle: 'miter',
                  pointBorderColor: "rgba(75,192,192,1)",
                  pointBackgroundColor: "#fff",
                  pointBorderWidth: 1,
                  pointHoverRadius: 5,
                  pointHoverBackgroundColor: "rgba(75,192,192,1)",
                  pointHoverBorderColor: "rgba(220,220,220,1)",
                  pointHoverBorderWidth: 2,
                  pointRadius: 1,
                  pointHitRadius: 10,
                  data: [],
                  spanGaps: false,
              }
          ]
      }
  });

  //вывод годовой статистики
  function statistic_year(year){
    $.ajax({
      url: "/statistic/year/"+year,
      type: "GET",
      success: function(data){
        var price = []
        var labels =[]
        $.each(data, function(key,value){
          price[key-1] = value;
          labels.push(getMonthName(key));
        })
        $("#title_year").text("Статистика за "+year+" год");

        var chart = document.getElementById("yearChart");
        chart.height = 70;
        var yearChart = new Chart(chart, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Сумма, грн.',
                    data: price,
                    backgroundColor: backgroundColor,
                    
                    borderWidth: 1
                }]
            }
        });
      }
    });
  }

  // вывод помесячной статистики
  function statistic_month(year, month){
    $.ajax({
      url: "/statistic/year/"+ year +"/month/"+month,
      type: "GET",
      success: function(data){
        var price = []
        monthChart.data.labels = []
        $.each(data, function(key,value){
          price[key-1] = value;
          monthChart.data.labels.push(key);
        })
        monthChart.data.datasets[0].data = price;
        monthChart.update();
        $("#title_month").text("Статистика за " +getMonthName(month)+" "+year);
      }
    });
  }
  // обработчик начатия на месяц календаря получаем дату
  $("#dt").datepicker({
    onSelect: function(formattedDate, date, inst) {
        statistic_month(date.getFullYear() ,date.getMonth()+1);
    }
  });

  //вывод диаграммы по количеству продаж товаров
  function statistic_product(){
    $.ajax({
      url: "/statistic/products",
      type: "GET",
      success: function(data){
        var product = document.getElementById("productChart");
        product.height = 275;
        var productChart = new Chart(product, {
          type: 'doughnut',
          data:{
            datasets: [{
                data: data['data'],
                backgroundColor: backgroundColor
            }],

            // These labels appear in the legend and in the tooltips when hovering different arcs
            labels: data['labels']
          }
        });
      }
    });
    $("#title_product").text("Статистика по количеству продаж ");
  }


  //получить имя месяца для таблицы входные данные 1..12
  function getMonthName(number){
    var month_names = [
                      "Январь", "Февраль", "Март",
                      "Апрель", "Май", "Июнь",
                      "Июль", "Август", "Сентябрь",
                      "Октябрь", "Ноябрь", "Декабрь"
    ];
    return month_names[number-1];
  }
});
