const winningHandLabels = ['High Card','Pair','Two Pair','Three of a Kind','Straight','Flush','Full House','Four of a Kind','Straight Flush','Royal Flush']
const colors = ['EEE','#CCC','#AAA','#888','#666','#444','333','#222','111','#000']

module.exports.parse = parseWinningHands

function parseWinningHands(pokerGame){
  const highCardRegex = /^(\w*)\sHigh/
  let winningHandCounts = new Array(winningHandLabels.length).fill(0)
  winningHands = pokerGame.hands.filter(i => i.action == 'collected' && i.cards)
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
  return {
    type: 'horizontalBar',
    data: {
      datasets: [{
        data: winningHandCounts,
        backgroundColor: colors
      }],
      labels: winningHandLabels
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