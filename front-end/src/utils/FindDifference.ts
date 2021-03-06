export const findDifference = (proposed: number[][], curr: number[][]): number[][] => {
  let differences: number[][] = [];

  //finding differences between boards
  for (let i = 0; i < curr.length; i++) {
    for (let j = 0; j < curr[0].length; j++) {
      if (curr[i][j] !== proposed[i][j]) {
        differences.push([i, j, proposed[i][j]]);
      }
    }
  }

  return differences;
};
