export function sameAnswer(actual, expected) {
  if (Array.isArray(actual) && Array.isArray(expected)) return actual.length === expected.length && [...actual].sort().every((value,index)=>value=== [...expected].sort()[index]);
  return String(actual ?? '').trim().toLowerCase() === String(expected ?? '').trim().toLowerCase();
}
export function evaluateObjective(questions, answers, negativeMarking=false) {
  let score=0; let manual=false;
  for(const question of questions){
    if(['descriptive','short','fill_blank'].includes(question.type)){manual=true;continue;}
    const answer=answers.find(item=>String(item.question)===String(question._id));
    if(answer&&sameAnswer(answer.value,question.correctAnswer))score+=question.marks;
    else if(answer&&negativeMarking)score-=question.negativeMarks||0;
  }
  return {objectiveScore:Math.max(0,score),manual};
}
