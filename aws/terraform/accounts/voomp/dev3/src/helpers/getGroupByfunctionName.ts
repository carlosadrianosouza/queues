export const getGroupByfunctionName = (functionName: string): string => {
  const group = /fn-(\w+)-/.exec(functionName)

  if (!group || !group[1]) {
    throw new Error(`Nome da função ${functionName} não é um nome de função válido`)
  }

  return group[1]
}