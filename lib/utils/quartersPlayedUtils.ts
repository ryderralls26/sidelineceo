/**
 * Calculate quarters played from lineup data
 * This parses the lineup JSON structure and counts quarters for each player
 */
export function calculateQuartersPlayedFromLineup(lineupData: any): Map<number, number> {
  const quarterCounts = new Map<number, number>()

  // The lineup structure has quarters array with positions object
  if (!lineupData || !lineupData.quarters) {
    return quarterCounts
  }

  // Iterate through each quarter
  lineupData.quarters.forEach((quarter: any) => {
    if (!quarter.positions) return

    // Iterate through each position in the quarter
    Object.values(quarter.positions).forEach((player: any) => {
      if (player && player.id) {
        const currentCount = quarterCounts.get(player.id) || 0
        quarterCounts.set(player.id, currentCount + 1)
      }
    })
  })

  return quarterCounts
}
