const winningHandLabels = ['High Card','Pair','Two Pair','Three of a Kind','Straight','Flush','Full House','Four of a Kind','Straight Flush','Royal Flush']
const colorsDark = ['rgba(0,129,0,1)','rgba(0,0,255,1)','rgba(255,0,0,1)','rgba(255,165,0,1)','rgba(128,0,128,1)','rgba(139,69,19,1)','rgba(0,0,0,1)', 'rgb(255,20,147,1)', 'rgba(47,79,79,1)']
const colorsLight = ['rgba(0,129,0,0.5)','rgba(0,0,255,0.5)','rgba(255,0,0,0.5)','rgba(255,165,0,0.5)','rgba(128,0,128,0.5)','rgba(139,69,19,0.5)','rgba(0,0,0,0.5)', 'rgb(255,20,147,0.5)', 'rgba(47,79,79,0.5)']

module.exports.parse = parseWinningHands

function parseWinningHands(pokerGame){
  const highCardRegex = /^(\w*)\sHigh/
  let chartDatasets = []
  pokerGame.players.forEach(function(player,i){
    let winningHandCounts = new Array(winningHandLabels.length).fill(0)
    winningHands = pokerGame.hands.filter(i => i.action == 'collected' && i.cards && i.player == player)
    winningHands.forEach(function(winningHand){
      if (highCardRegex.test(winningHand.winningHand)){
        winningHand = 'High Card'
      }
      // Kludge to fix Pair/One Pair discrepancy between logs for Omaha and Hold'em
      else {winningHand = winningHand.winningHand.replace('One ','').split(', ')[0]}
      winningHandLabels.forEach(function(v,i){
        if (v == winningHand){
          winningHandCounts[i] += 1
        }
      })
    })
    chartDatasets.push(
      {
        label: player,
        data: winningHandCounts,
        backgroundColor: colorsLight[i],
        borderWidth: 1,
        borderColor: colorsDark[i]
      }
    )
  })
  return {
    type: 'horizontalBar',
    data: {
      datasets: chartDatasets,
      labels: winningHandLabels
    },
    options: {
      legend: {
        labels: {
          boxWidth: 16,
          fontSize: 16,
          fontFamily: "Roboto, sans-serif",
          padding: 16
        }
      },
      scales: {
        xAxes: [{
          stacked: true,
          type: 'linear',
          ticks: {
            precision:0,
            beginAtZero: true,
            fontSize: 18,
            fontFamily: "Roboto, sans-serif"
          }
        }],
        yAxes: [{
          stacked: true,
          barPercentage: 0.6,
          ticks: {
            fontSize: 18,
            fontFamily: "Roboto, sans-serif"
          }
        }]
      }
    }
  }
}