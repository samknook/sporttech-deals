#!/usr/bin/env node
/* Current known evidence only. No unverifiable readiness claims. */
'use strict';
const readiness=require('./pilot-readiness.cjs');
const assessment=readiness.assess({});
console.log(readiness.report(assessment));
console.log('This report covers pilot production readiness, not progress on the public demo or prototype.');
if(assessment.releaseCandidate)process.exitCode=2;
