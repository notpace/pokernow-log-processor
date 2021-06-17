const colorsDark = ['rgba(0,129,0,1)','rgba(0,0,255,1)','rgba(255,0,0,1)','rgba(255,165,0,1)','rgba(128,0,128,1)','rgba(139,69,19,1)','rgba(0,0,0,1)', 'rgb(255,20,147,1)', 'rgba(47,79,79,1)']
const colorsLight = ['rgba(0,129,0,0.5)','rgba(0,0,255,0.5)','rgba(255,0,0,0.5)','rgba(255,165,0,0.5)','rgba(128,0,128,0.5)','rgba(139,69,19,0.5)','rgba(0,0,0,0.5)', 'rgb(255,20,147,0.5)', 'rgba(47,79,79,0.5)']

module.exports.parse = parsePreflopBehavior

function parsePreflopBehavior(pokerGame){
  hands = Array.from(Array(pokerGame.numberOfHands),(x,i)=>i+1)
  allPreflopAction = []
  hands.forEach(function(hand){
    handAction = pokerGame.hands.filter(x => x.handNumber == hand)
    preflopAction = []
    let i = 0
    do {
      preflopAction.push(handAction[i])
      i++
    } while (handAction[i].action != 'flop' && handAction[i].action != 'collected')
    allPreflopAction.push({hand:hand, preflopAction:preflopAction})
  })
  // Calculate VPIP and PFR
  preflopBehavior = []
  pokerGame.players.forEach(function(player,i){
    handsPlayed = 0
    const playerStraddle = (x) => x.action == 'straddle'
    handsRaised = 0
    const playerRaise = (x) => x.action == 'raises'
    handsParticipated = 0
    const playerCall = (x) => x.action == 'calls'
    allPreflopAction.forEach(function(hand){
      playerActions = hand.preflopAction.filter(x=>x.player==player)
      if (playerActions.length >= 1){
        handsPlayed++
        if (playerActions.some(playerRaise)){
          handsRaised++
          handsParticipated++
        }
        else if (playerActions.some(playerCall) || playerActions.some(playerStraddle)){
          handsParticipated++
        }
      }
    })
    preflopBehavior.push({
      player: player,
      borderColor: colorsDark[i],
      backgroundColor: colorsLight[i],
      handsPlayed: handsPlayed,
      VPIP: (handsParticipated / handsPlayed * 100).toFixed(2),
      PFR: (handsRaised / handsParticipated * 100).toFixed(2)
    })
  })
  preflopBehaviorChartData = preflopBehavior.map(function(player){
    return {
      label: player.player,
      data: [{x: player.PFR, y: player.VPIP}],
      borderWidth: 1,
      borderColor: player.borderColor,
      backgroundColor: player.backgroundColor
    }
  })
  return {
    type: 'scatter',
    data: {
      datasets: preflopBehaviorChartData
    },
    options: {
      maintainAspectRatio: false,
      elements: {
        point: {
          radius: 9,
          hitRadius: 9,
          hoverRadius: 11
        }
      },
      legend: {
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 12,
          fontSize: 16,
          fontFamily: "Roboto, sans-serif",
          padding: 22
        }
      },
      scales: {
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Voluntary Participation (% of hands called)',
            fontSize: 18,
            fontFamily: "Roboto, sans-serif"
          },
          ticks: {
            precision:0,
            beginAtZero: true
          }
        }],
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Aggression (% of hands raised)',
            fontSize: 18,
            fontFamily: "Roboto, sans-serif"
          },
          ticks: {
            precision: 0,
            beginAtZero: true
          }
        }]
      }
    }
  }
}