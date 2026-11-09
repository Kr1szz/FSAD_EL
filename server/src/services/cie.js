export function consolidateComponents(components, missingTreatment='zero', bestOf, rounding='two_decimals') {
  const present=components.filter(component=>component.rawMarks!==null&&component.rawMarks!==undefined);
  let selected=present;
  if(bestOf&&bestOf>0)selected=[...present].sort((a,b)=>(b.rawMarks/b.maxMarks*b.weight)-(a.rawMarks/a.maxMarks*a.weight)).slice(0,bestOf);
  let total=selected.reduce((sum,component)=>sum+(component.rawMarks/component.maxMarks)*component.weight,0);
  const includedWeight=selected.reduce((sum,component)=>sum+component.weight,0);
  if(missingTreatment==='exclude'&&includedWeight>0){const targetWeight=bestOf?components.slice(0,bestOf).reduce((sum,c)=>sum+c.weight,0):components.reduce((sum,c)=>sum+c.weight,0);total=total/includedWeight*targetWeight;}
  if(rounding==='integer')total=Math.round(total);else if(rounding==='two_decimals')total=Math.round(total*100)/100;
  return {total,selected:components.map(component=>({...component,included:selected.includes(component)}))};
}
