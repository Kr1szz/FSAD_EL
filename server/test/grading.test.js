import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateObjective, sameAnswer } from '../src/services/grading.js';
test('scores objective responses and applies negative marks',()=>{const questions=[{_id:'1',type:'single',marks:2,negativeMarks:0.5,correctAnswer:'A'},{_id:'2',type:'multiple',marks:3,negativeMarks:1,correctAnswer:['B','C']}];const answers=[{question:'1',value:'wrong'},{question:'2',value:['C','B']}];assert.deepEqual(evaluateObjective(questions,answers,true),{objectiveScore:2.5,manual:false});});
test('keeps descriptive answers pending manual evaluation',()=>{assert.deepEqual(evaluateObjective([{_id:'1',type:'descriptive',marks:5}],[],false),{objectiveScore:0,manual:true});});
test('normalizes scalar answer casing and whitespace',()=>assert.equal(sameAnswer(' True ','true'),true));
