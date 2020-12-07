// Set up for hand outcome searches
const showdownRegex = /.*collected (\d*(?:\.\d\d)?) from pot with ([\w\s]*)[,(].*/
const showdown = (row) => row.entry.search(showdownRegex) >= 0

module.exports.getParsedWinningHands = getParsedWinningHands

function getParsedWinningHands(data){
  return getWinningHandsChartData(getWinningHands(data))
}

// Determine which hands won at showdown
function getWinningHands(allHands){
  let winningHands = []
  allHands.forEach(function(hand){
    if (hand.entries.some(showdown)){
      let winningHand = ''
      hand.entries.forEach(function(row){
        if (row.entry.match(showdownRegex)){
          winningHand = row.entry.match(showdownRegex)[2]
        }
      })
      winningHands.push(winningHand)
    }
  })
  let fixedHighCards = winningHands.map(mapHighCard)
  return fixedHighCards
}

function mapHighCard(hand){
  const highCardRegex = /[\w\s]High/
  if (hand.search(highCardRegex) >= 0){
    return 'High Card'
  }
  else {return hand}
}

function getWinningHandsChartData(winningHands){
  let winningHandLabels = ['High Card','Pair','Two Pair','Three of a Kind','Straight','Flush','Full House','Four of a Kind','Straight Flush','Royal Flush']
  let winningHandCounts = []
  winningHandLabels.forEach(function(hand){
    let count = 0
    winningHands.forEach(function(winner){
      if (hand == winner){
        count += 1
      }
    })
    winningHandCounts.push(count)
  })
  return {
    type: 'horizontalBar',
    data: {
      datasets: [{
        data: winningHandCounts,
        backgroundColor: [
          'EEE','#CCC','#AAA','#888','#666','#444','333','#222','111','#000'
        ]
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