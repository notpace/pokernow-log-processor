// Set up regexes for filtering actions
const actionRegex = /^"(.*) @ .*" (\bchecks\b|\bbets\b|\bcalls\b|\braises\b|\bfolds\b)/
const handBeginRegex = /-- starting hand #(\d*).*/

module.exports.getParsedTimeToAct = getParsedTimeToAct

function getParsedTimeToAct(data){
  return getTimeToActStats(getActionData(data))
}

// Filter out all non-action entries and calculate time since last action
function getActionData(allHands){
  let allActions = []
  allHands.forEach(function(hand){
    let previousActionTime = new Date()
    hand.entries.forEach(function(row){
      if (handBeginRegex.test(row.entry)){
        previousActionTime = new Date(row.at)
      }
      else if (actionRegex.test(row.entry)){
        let player = row.entry.match(actionRegex)[1]
        let action = row.entry.match(actionRegex)[2]
        let actionTime = new Date(row.at)
        let timeToAct = (actionTime - previousActionTime)/1000 // Diff in seconds
        allActions.push({
          player: player,
          action: action,
          timeToAct: timeToAct
        })
        previousActionTime = actionTime
      }
    })
  })
  return allActions
}

// Calculate averge time to act for each player
function getTimeToActStats(allActions){
  let players = []
  let timeToAct = []
  allActions.forEach(function(row){
    if (players.indexOf(row.player) < 0){
      players.push(row.player)
    }
  })
  players.forEach(function(player){
    playerActions = allActions.filter(action => action.player == player)
    playerTimesToAct = playerActions.map(action => action.timeToAct)
    playerTotalTimeToAct = playerTimesToAct.reduce((previous,current) => {
      return previous + current
    })
    playerMaxTimeToAct = Math.max(...playerTimesToAct).toFixed(2)
    playerAverageTimeToAct = (playerTotalTimeToAct / playerActions.length).toFixed(2)
    timeToAct.push({
      player: player,
      averageTimeToAct: playerAverageTimeToAct,
      maxTimeToAct: playerMaxTimeToAct
    })
  })
  // Sort by average time to act, descending
  timeToAct.sort(function(a,b){
    return b.averageTimeToAct - a.averageTimeToAct
  })
  // Turn the TimeToAct Table into an Object for Handlebars
  return Object.assign({}, timeToAct)
}