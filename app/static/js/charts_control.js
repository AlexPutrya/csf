$(document).ready(function(){
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth()+1;
  statistic_month(year, month);
  // сразу отрисовываем годовой график
  statistic_year(year);

  var year = document.getElementById("yearChart");
  var yearChart = new Chart(year, {
      type: 'bar',
      data: {
          labels: [],
          datasets: [{
              label: 'Сумма, грн.',
              data: [],
              backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(255, 206, 86, 0.2)',
                  'rgba(75, 192, 192, 0.2)',
                  'rgba(153, 102, 255, 0.2)',
                  'rgba(255, 159, 64, 0.2)'
              ],
              borderColor: [
                  'rgba(255,99,132,1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 159, 64, 1)'
              ],
              borderWidth: 1
          }]
      }
  });



  var data = {
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
  };
  var month = document.getElementById("monthChart");
  var monthChart = new Chart(month, {
      type: 'line',
      data: data,
  });

  function statistic_year(year){
    $.ajax({
      url: "/statistic/year/"+(year-1),
      type: "GET",
      success: function(data){
        var price = []
        yearChart.data.labels =[]
        $.each(data, function(key,value){
          price[key-1] = value;
          yearChart.data.labels.push(getMonthName(key));
        })
        yearChart.data.datasets[0].data = price;
        yearChart.update()
      }
    });
  }

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
        monthChart.update()
      }
    });
  }

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
