module.exports.parse = parseTimeToAct

function parseTimeToAct(pokerGame){
  const actionsFilterArray = ['beginHand','checks','bets','calls','raises','folds']
  const actionsFilter = (i) => actionsFilterArray.includes(i.action)
  let players = pokerGame.players
  let timedActions = []
  let timeToActTable = []
  let filteredActions = pokerGame.hands.filter(actionsFilter)
  let previousActionTime = new Date()
  filteredActions.forEach(function(row){
    if (row.action == 'handBegin'){
      previousActionTime = new Date(row.at)
    }
    else {
      let actionTime = new Date(row.at)
      let timeToAct = (actionTime - previousActionTime)/1000 // Diff in seconds
      timedActions.push({
        player: row.player,
        action: row.action,
        timeToAct: timeToAct
      })
      previousActionTime = actionTime
    }
  })
  players.forEach(function(player){
    playerActions = timedActions.filter(action => action.player == player)
    playerTimesToAct = playerActions.map(action => action.timeToAct)
    playerTotalTimeToAct = playerTimesToAct.reduce((previous,current) => {
      return previous + current
    })
    playerMaxTimeToAct = Math.max(...playerTimesToAct).toFixed(2)
    playerAverageTimeToAct = (playerTotalTimeToAct / playerActions.length).toFixed(2)
    timeToActTable.push({
      player: player,
      averageTimeToAct: playerAverageTimeToAct,
      maxTimeToAct: playerMaxTimeToAct
    })
  })
  // Sort by average time to act, descending
  timeToActTable.sort(function(a,b){
    return b.averageTimeToAct - a.averageTimeToAct
  })
  // Turn the TimeToAct Table into an Object for Handlebars
  return Object.assign({}, timeToActTable)
}