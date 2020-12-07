const colors = ['green','blue','red','orange','purple','brown','black', 'pink', 'gray']
const playerRegex = /\"(.*)\s@/
const stackRegex = /\(([^)]+)\)/

module.exports.getParsedStackSizes = getParsedStackSizes

function getParsedStackSizes(data){
  return getStackSizeChartData(pivotStacks(flattenStackData(getStacks(data))))
}

// Get stack info
function getStacks(data){
  let allStacks = data.filter(item => item.entry.search("Player stacks") >= 0 );
  return parsedStacks = allStacks.map(function(obj) {
    return { order: obj.order, at: obj.at, entry: parseStacks(obj.entry) };
  });
}

function parseStacks(stacks){
  let splitStacks = stacks.replace("Player stacks: ","").split(" | ")
  let parsedStacks = []
  splitStacks.forEach(function(stack){
    let player = stack.match(playerRegex)[1].trim();
    let stackTotal = parseFloat(stack.match(stackRegex)[1]);
    parsedStacks.push({"player": player, "stack": stackTotal})
  })
  return parsedStacks;
}

function flattenStackData(stacks){
  let header = ['hand','player','stack']
  let flattenedStacks = [header]
  let hand = 1
  stacks.forEach(function(stack){
    stack.entry.forEach(function(playerStack){
      let player = playerStack.player
      let stackTotal = playerStack.stack
      flattenedStacks.push([hand,player,stackTotal])
    })
    hand += 1
  })
  return flattenedStacks
}

function pivotStacks(flattenedStacks){
  // Get just the data (no header row)
  let data = flattenedStacks.slice(1,)
  // Get all the players
  let players = []
  data.forEach(function(row){
    if (players.indexOf(row[1]) < 0 ){
      players.push(row[1])
    }
  })
  // Get all the hands
  totalHands = 0
  data.forEach(function(row){
    if (row[0] > totalHands ){
      totalHands = row[0]
    }
  })
  // Iterate through hands and grab the stack size for each player
  allHands = [['hand'].concat(players)]
  hand = 1
  while (hand <= totalHands){
    handData = Array.apply(null, Array(players.length + 1)).map(function () {})
    handData[0] = hand
    players.forEach(function(player, index){
      data.forEach(function(row){
        if (row[0] == hand && row[1] == player) {
          handData[index + 1] = row[2]
        }
      })
    })
    allHands.push(handData)
    hand += 1
  }
  return(allHands)
}

function getStackSizeChartData(pivotData){
  // Get player Names
  players = pivotData[0]
  players.shift()
  // Get the total number of hands and make the x-axis label
  totalHands = pivotData.length - 1
  xlabel = Array.from(Array(totalHands),(x,i)=>i)
  // Iterate through each player and grab their stack size from each hand
  allPlayerData = []
  players.forEach(function(player,index){
    playerName = player
    playerData = []
    pivotData.slice(1,).forEach(function(row){
      playerData.push(row[index+1])
    })
    allPlayerData.push({
      label: playerName,
      data: playerData,
      borderColor: colors[index],
      backgroundColor: colors[index],
      lineTension: 0,
      pointRadius: 0,
      fill: false,
      borderWidth: 2
    })
  })
  return {
    type: 'line',
    data: {
      labels: xlabel,
      datasets: allPlayerData
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
          scaleLabel: {
            display: false,
            labelString: 'HAND NUMBER',
            fontSize: 18,
            fontFamily: "Roboto, sans-serif"
          },
          ticks: {
            maxTicksLimit: 12,
            fontSize: 18
          }
        }]
      }
    }
  }
}