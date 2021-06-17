const colorsDark = ['rgba(0,129,0,1)','rgba(0,0,255,1)','rgba(255,0,0,1)','rgba(255,165,0,1)','rgba(128,0,128,1)','rgba(139,69,19,1)','rgba(0,0,0,1)', 'rgb(255,20,147,1)', 'rgba(47,79,79,1)']
const colorsLight = ['rgba(0,129,0,0.5)','rgba(0,0,255,0.5)','rgba(255,0,0,0.5)','rgba(255,165,0,0.5)','rgba(128,0,128,0.5)','rgba(139,69,19,0.5)','rgba(0,0,0,0.5)', 'rgb(255,20,147,0.5)', 'rgba(47,79,79,0.5)']

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
      borderColor: colorsDark[index],
      backgroundColor: colorsLight[index],
      lineTension: 0,
      pointRadius: 0,
      fill: false,
      borderWidth: 1
    })
  })
  let chartMax = pokerGame.numberOfHands + (20 - (pokerGame.numberOfHands % 20))
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