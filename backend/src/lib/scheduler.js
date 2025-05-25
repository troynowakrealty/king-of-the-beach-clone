export function generateSchedule(players){
  const n = players.length;
  if(n < 4 || n > 8) return [];
  let list = players.slice();
  const hasBye = n % 2 === 1;
  if(hasBye) list.push('BYE');
  const totalRounds = list.length - 1;
  const rounds=[];
  for(let r=0;r<totalRounds;r++){
    const pairs=[];
    for(let i=0;i<list.length/2;i++){
      pairs.push([list[i], list[list.length-1-i]]);
    }
    const games=[];
    for(let i=0;i<pairs.length;i+=2){
      const [a1,a2]=pairs[i];
      if(i+1<pairs.length){
        const [b1,b2]=pairs[i+1];
        games.push({teamA:[a1,a2], teamB:[b1,b2]});
      }else if(hasBye){
        const sit = [a1,a2].includes('BYE') ? ([a1,a2].find(p=>p!=='BYE')) : 'BYE';
        games.push({teamA:[a1,a2], teamB:null, sitsOut:sit});
      }
    }
    rounds.push(games);
    // rotate
    list.splice(1,0,list.pop());
  }
  return rounds;
}
