export const matchArrs = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return null
  for (var i = 0; i < arr1.length; i++) {
		if (arr1[i] !== arr2[i]){
      arr1 = arr2
    }
	}
  return arr1
}