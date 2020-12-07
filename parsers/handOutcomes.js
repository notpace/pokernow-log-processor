// Set up for hand outcome searches
const showdownRegex = /.*collected (\d*(?:\.\d\d)?) from pot with ([\w\s]*)[,(].*/
const showdown = (row) => row.entry.search(showdownRegex) >= 0
const riverRegex = /river: .*/
const river = (row) => row.entry.search(riverRegex) >= 0
const turnRegex = /turn: .*/
const turn = (row) => row.entry.search(turnRegex) >= 0
const flopRegex = /flop: .*/
const flop = (row) => row.entry.search(flopRegex) >= 0

module.exports.getParsedHandOutcomes = getParsedHandOutcomes

function getParsedHandOutcomes(data){
  return getHandOutcomesChartData(getHandOutcomes(data))
}
  
// Determine where action ended on each hand
function getHandOutcomes(allHands){
  let handOutcomes = []
  let handNum = 1
  allHands.forEach(function(hand){
    let outcome = ''
    if (hand.entries.some(showdown)){outcome='Showdown'}
    else if (hand.entries.some(river)){outcome='River'}
    else if (hand.entries.some(turn)){outcome='Turn'}
    else if (hand.entries.some(flop)){outcome='Flop'}
    else {outcome='Preflop'}
    handOutcomes.push({hand: handNum, outcome: outcome})
    handNum += 1
  })
  return handOutcomes
}

function getHandOutcomesChartData(handOutcomes){
  totalHands = handOutcomes.length
  let outcomeLabels = ['Preflop','Flop','Turn','River','Showdown']
  outcomeSums = new Array(outcomeLabels.length).fill(0)
  outcomeSums.forEach(function(outcome,index){
    handOutcomes.forEach(function(hand){
      if (hand.outcome == outcomeLabels[index]) {
        outcomeSums[index] += 1
      }
    })
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