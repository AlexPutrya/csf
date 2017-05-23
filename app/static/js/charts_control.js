$(document).ready(function(){
  var month = document.getElementById("monthChart");
  var monthChart = new Chart(month, {
      type: 'bar',
      data: {
          labels: [],
          datasets: [{
              label: 'Сумма',
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
      },
      options: {
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero:true
                  }
              }]
          }
      }
  });



  var data = {
      labels: ["January", "February", "March", "April", "May", "June", "July"],
      datasets: [
          {
              label: "My First dataset",
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
              data: [65, 59, 80, 81, 56, 55, 40],
              spanGaps: false,
          }
      ]
  };
  var year = document.getElementById("yearChart");
  var yearChart = new Chart(year, {
      type: 'line',
      data: data,
  });


  $("#adddata").click(function(){
    $.ajax({
      url: "/statistic/year/2016",
      type: "GET",
      success: function(data){
        var price = []
        monthChart.data.labels =[]
        $.each(data, function(key,value){
          price[key-1] = value;
          monthChart.data.labels.push(key);
        })
        monthChart.data.datasets[0].data = price;
        monthChart.update()
      }
    });
  });

  $("#adddata2").click(function(){
    $.ajax({
      url: "/statistic/year/2016/month/4",
      type: "GET",
      success: function(data){
        var price = []
        yearChart.data.labels = []
        $.each(data, function(key,value){
          price[key-1] = value;
          yearChart.data.labels.push(key);
        })
        yearChart.data.datasets[0].data = price;
        yearChart.update()
      }
    });
  });
});
