import { Assessment, Attempt, Grade, Question } from '../models/index.js';
import { evaluateObjective } from './grading.js';
export async function finalizeAttempt(attemptId) {
  const at=await Attempt.findOneAndUpdate({_id:attemptId,state:'IN_PROGRESS'},{$set:{state:'SUBMITTED',submittedAt:new Date()}},{new:true}).populate('assessment');
  if(!at)return Attempt.findById(attemptId);
  const questions=await Question.find({_id:{$in:at.questionOrder}});
  const {objectiveScore}=evaluateObjective(questions,at.answers);
  at.objectiveScore=objectiveScore;at.score=objectiveScore;await at.save();
  await Grade.findOneAndUpdate({assessment:at.assessment._id,student:at.student},{$set:{attempt:at._id,rawMarks:objectiveScore,maxMarks:at.assessment.maxMarks}},{upsert:true,new:true});
  return at;
}
export async function submitExpiredAttempts(now=new Date()) {
  const expired=await Attempt.find({state:'IN_PROGRESS',deadlineAt:{$lte:now}}).select('_id assessment').limit(500);
  for(const item of expired){const assessment=await Assessment.findById(item.assessment).select('state');if(assessment?.state!=='PAUSED')await finalizeAttempt(item._id);}
  return expired.length;
}
