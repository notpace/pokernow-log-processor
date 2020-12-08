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
        playerStackSizes.push({
          x: hand,
          y: stacks.filter(i => i.player == player)[0].stackSize
        })
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
  let chartMax = pokerGame.numberOfHands + 10 - (pokerGame.numberOfHands + 10) % 20
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
          type: 'linear',
          scaleLabel: {
            display: false,
            labelString: 'HAND NUMBER',
            fontSize: 18,
            fontFamily: "Roboto, sans-serif"
          },
          ticks: {
            min: 0,
            max: chartMax,
            stepSize: 20,
            fontSize: 18
          }
        }]
      }
    }
  }
}