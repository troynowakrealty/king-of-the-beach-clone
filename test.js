import { generateSchedule } from './backend/src/lib/scheduler.js';

function testSchedule(){
  const players=['A','B','C','D'];
  const rounds=generateSchedule(players);
  if(rounds.length!==3){ throw new Error('schedule length'); }
}

try{ testSchedule(); console.log('tests passed'); }
catch(err){ console.error('tests failed', err); process.exit(1); }
