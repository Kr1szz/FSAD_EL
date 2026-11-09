import test from 'node:test';
import assert from 'node:assert/strict';
import { consolidateComponents } from '../src/services/cie.js';
test('consolidates weighted component marks with configured rounding',()=>{const {total}=consolidateComponents([{rawMarks:8,maxMarks:10,weight:20},{rawMarks:15,maxMarks:20,weight:30}], 'zero', undefined,'integer');assert.equal(total,39);});
test('applies best-of N to weighted components',()=>{const {total,selected}=consolidateComponents([{name:'CIE1',rawMarks:9,maxMarks:10,weight:25},{name:'CIE2',rawMarks:5,maxMarks:10,weight:25},{name:'CIE3',rawMarks:8,maxMarks:10,weight:25}], 'zero', 2,'none');assert.equal(total,42.5);assert.deepEqual(selected.map(c=>c.included),[true,false,true]);});
test('excludes missing marks and rescales when policy says exclude',()=>{const {total}=consolidateComponents([{rawMarks:8,maxMarks:10,weight:25},{rawMarks:null,maxMarks:10,weight:25}], 'exclude', undefined,'integer');assert.equal(total,40);});
