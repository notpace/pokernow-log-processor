module.exports.parse = parseHandOutcomes

function parseHandOutcomes(pokerGame){
  hands = Array.from(Array(pokerGame.numberOfHands),(x,i)=>i+1)
  outcomeLabels = ['Preflop','Flop','Turn','River','Showdown']
  outcomeSums = new Array(outcomeLabels.length).fill(0)
  hands.forEach(function(hand){
    handActions = pokerGame.hands.filter(i => i.handNumber == hand)
    // Showdown check must be >= 1 to capture split pots
    if (handActions.filter(i => i.action == 'collected' && i.cards).length >= 1){
      outcomeSums[4] += 1
    }
    else if (handActions.filter(i => i.action == 'river').length == 1){
      outcomeSums[3] += 1
    }
    else if (handActions.filter(i => i.action == 'turn').length == 1){
      outcomeSums[2] += 1
    }
    else if (handActions.filter(i => i.action == 'flop').length == 1){
      outcomeSums[1] += 1
    }
    else outcomeSums[0] += 1
  })
  return {
    type: 'horizontalBar',
    data: {
      datasets: [{
        data: outcomeSums,
        backgroundColor: [
          '#dceeff', '#c6deff', '#a7ccff', '#85a8e3', '#6c9bd0'
        ]
      }],
      labels: outcomeLabels
    },
    options: {
      legend: {
        display: false
      },
      scales: {
        xAxes: [{
          type: 'linear',
          ticks: {
            precision:0,
            beginAtZero: true,
            fontSize: 18,
            fontFamily: "Roboto, sans-serif"
          }
        }],
        yAxes: [{
          ticks: {
            fontSize: 18,
            fontFamily: "Roboto, sans-serif"
          }
        }]
      }
    }
  }
}