const ledgerTableParser = require('./ledgerTable.js')
const stackSizeParser = require('./stackSizes.js')
const handOutcomesParser = require('./handOutcomes.js')
const winningHandsParser = require('./winningHands.js')
const timeToActParser = require('./timeToAct.js')

module.exports.ledgerTable = ledgerTable
module.exports.stackSizes = stackSizes
module.exports.handOutcomes = handOutcomes
module.exports.winningHands = winningHands
module.exports.timeToAct = timeToAct

function ledgerTable(data){
  return ledgerTableParser.getParsedLedgerTable(data)
}

function stackSizes(data){
  let sortedData = sortByOrder(orderToInt(data));
  return stackSizeParser.getParsedStackSizes(sortedData)
}

function handOutcomes(data){
  let allHands = getHands(sortByOrder(orderToInt(data)))
  return handOutcomesParser.getParsedHandOutcomes(allHands)
}

function winningHands(data){
  let allHands = getHands(sortByOrder(orderToInt(data)))
  return winningHandsParser.getParsedWinningHands(allHands)
}

function timeToAct(data){
  let allHands = getHands(sortByOrder(orderToInt(data)))
  return timeToActParser.getParsedTimeToAct(allHands)
}

//Parsing Cleanup
function orderToInt(data){
  return fixedOrder = data.map(function(obj) {
    return {order: parseInt(obj.order), at: obj.at, entry: obj.entry};
  });
}

function sortByOrder(data){
  return data.sort(function(a,b){
    return a.order - b.order;
  })
}

// Get total number of hands
function getTotalHands(logFile){
  const endHandRegex = /-- ending hand #(\d*) --/
  let endingHands = logFile.filter(row => row.entry.search(endHandRegex) >= 0)
  return endingHands.length
}

// Filter admin actions
function handsOnly(logFile){
  const adminRegex = /(The admin|The player|Your hand).*/
  return logFile.filter(row => row.entry.search(adminRegex) < 0)
}

// Separate all the hands
function getHands(logFile){
  // Create an empty array of hand objects
  let totalHands = getTotalHands(logFile)
  handsData = Array.apply(null, Array(totalHands))
  let i = 0
  for (i = 0; i < totalHands; i++) {
    handsData[i] = {hand: i+1, entries: []}
  }
  // Iterate through hands to populate the empty array
  const handBeginRegex = /-- starting hand #(\d*).*/
  let hand = 0
  handsOnly(logFile).forEach(function(row){
    if (row.entry.search(handBeginRegex) >= 0) {
      hand += 1
    }
    handsData.forEach(function(obj){
      if (obj.hand === hand) {
        obj.entries.push({
          order: row.order,
          at: row.at,
          entry: row.entry
        })
      }
    })
  })
  return handsData
}