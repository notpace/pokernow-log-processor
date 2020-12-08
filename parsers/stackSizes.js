const colors = ['green','blue','red','orange','purple','brown','black', 'pink', 'gray']

module.exports.parse = parseStackSizes

function parseStackSizes(pokerGame){
  players = pokerGame.players
  hands = Array.from(Array(pokerGame.numberOfHands),(x,i)=>i+1)
  let allStackSizes = []
  players.forEach(function(player,index){
    let playerStackSizes = []
    hands.forEach(function(hand){
      stacks = pokerGame.stacks.filter(i => i.handNumber == hand)[0].stackSizes
      if (stacks.some(i => i.player == player)){
        playerStackSizes.push(stacks.filter(i => i.player == player)[0].stackSize)
      }
      else playerStackSizes.push(null)
    })
    allStackSizes.push({
      label: player,
      data: playerStackSizes,
      borderColor: colors[index],
      backgroundColor: colors[index],
      lineTension: 0,
      pointRadius: 0,
      fill: false,
      borderWidth: 2
    })
  })
  return {
    type: 'line',
    data: {
      labels: hands,
      datasets: allStackSizes
    },
    options: {
      maintainAspectRatio: false,
      legend: {
        labels: {
          boxWidth: 16,
          fontSize: 16,
          fontFamily: "Roboto, sans-serif",
          padding: 16
        }
      },
      scales: {
        yAxes: [{
          ticks: {
            precision:0,
            beginAtZero: true,
            fontSize: 18,
            fontFamily: "Roboto, sans-serif"
          }
        }],
        xAxes: [{
          scaleLabel: {
            display: false,
            labelString: 'HAND NUMBER',
            fontSize: 18,
            fontFamily: "Roboto, sans-serif"
          },
          ticks: {
            maxTicksLimit: 10,
            fontSize: 18
          }
        }]
      }
    }
  }
}