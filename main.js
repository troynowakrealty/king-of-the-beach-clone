const root = document.getElementById('root');

const views = {
  home: createHomeView(),
  schedule: createScheduleView(),
  scores: createScoreView(),
  results: createResultsView()
};

Object.values(views).forEach(v => root.appendChild(v));
showView('home');

function showView(name){
  Object.keys(views).forEach(k => views[k].classList.remove('active'));
  views[name].classList.add('active');
}

function createHomeView(){
  const view = document.createElement('div');
  view.className = 'view home-view container';

  const header = document.createElement('header');
  header.innerHTML = '<h1>King of the Beach</h1>';
  view.appendChild(header);

  const countLabel = document.createElement('p');
  countLabel.textContent = 'Number of Players (4-8)';
  view.appendChild(countLabel);

  const countInput = document.createElement('input');
  countInput.type = 'number';
  countInput.min = 4;
  countInput.max = 8;
  countInput.value = 4;
  view.appendChild(countInput);

  const namesDiv = document.createElement('div');
  view.appendChild(namesDiv);

  const startBtn = document.createElement('button');
  startBtn.textContent = 'Start Tournament';
  view.appendChild(startBtn);

  countInput.addEventListener('change', () => {
    buildNameInputs();
  });

  startBtn.addEventListener('click', async () => {
    if(!validateNames()) return;
    playerNames = Array.from(namesDiv.querySelectorAll('input')).map(i=>i.value.trim());
    const res = await fetch('http://localhost:4000/api/tournaments', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({name:'Tournament', players:playerNames})
    });
    const data = await res.json();
    tournamentId = data.id;
    rounds = data.games;
    views.schedule.render();
    showView('schedule');
  });

  function buildNameInputs(){
    namesDiv.innerHTML = '';
    for(let i=0;i<countInput.value;i++){
      const input = document.createElement('input');
      input.placeholder = `Player ${i+1}`;
      namesDiv.appendChild(input);
    }
  }

  function validateNames(){
    const inputs = namesDiv.querySelectorAll('input');
    return Array.from(inputs).every(i=>i.value.trim().length>0);
  }

  buildNameInputs();
  return view;
}

let playerNames = [];
let rounds = [];
let tournamentId = null;

function createScheduleView(){
  const view = document.createElement('div');
  view.className = 'view schedule-view container';

  const header = document.createElement('header');
  header.innerHTML = '<h1>Schedule</h1>';
  view.appendChild(header);

  const list = document.createElement('div');
  view.appendChild(list);

  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next';
  view.appendChild(nextBtn);

  nextBtn.addEventListener('click', () => {
    buildScoreInputs();
    showView('scores');
  });

  view.render = () => {
    list.innerHTML = '';
    rounds.forEach((games,idx) => {
      games.forEach(g=>{
        const div = document.createElement('div');
        div.className = 'match';
        let text = `Round ${idx+1}: ${g.teamA[0]} & ${g.teamA[1]}`;
        if(g.teamB){
          text += ` vs ${g.teamB[0]} & ${g.teamB[1]}`;
        }
        if(g.sitsOut) text += ` (${g.sitsOut} sits)`;
        div.textContent = text;
        list.appendChild(div);
      });
    });
  };

  return view;
}

function createScoreView(){
  const view = document.createElement('div');
  view.className = 'view score-view container';

  const header = document.createElement('header');
  header.innerHTML = '<h1>Enter Scores</h1>';
  view.appendChild(header);

  const list = document.createElement('div');
  view.appendChild(list);

  const submitBtn = document.createElement('button');
  submitBtn.textContent = 'Submit Scores';
  view.appendChild(submitBtn);

  submitBtn.addEventListener('click', submitScores);

  view.render = () => {
    list.innerHTML = '';
    rounds.forEach((games,roundIdx) => {
      games.forEach(g=>{
        const div = document.createElement('div');
        div.className = 'match';
        const input1=document.createElement('input');
        input1.type='number';
        input1.placeholder=`${g.teamA[0]} & ${g.teamA[1]}`;
        const input2=document.createElement('input');
        input2.type='number';
        if(g.teamB){
          input2.placeholder=`${g.teamB[0]} & ${g.teamB[1]}`;
        }else{ input2.disabled=true; }
        div.appendChild(input1);
        div.appendChild(input2);
        list.appendChild(div);
      });
    });
  };

  return view;
}

function createResultsView(){
  const view = document.createElement('div');
  view.className = 'view results-view container';

  const header = document.createElement('header');
  header.innerHTML = '<h1>Results</h1>';
  view.appendChild(header);

  const ul = document.createElement('ul');
  ul.className = 'leaderboard';
  view.appendChild(ul);

  view.render = (leaderboard=[]) => {
    ul.innerHTML = '';
    leaderboard.forEach((p,idx)=>{
      const li = document.createElement('li');
      if(idx===0) li.classList.add('winner');
      li.textContent = `${p.name} (W:${p.wins}, +/-:${p.plusMinus})`;
      ul.appendChild(li);
    });
  };

  return view;
}

async function submitScores(){
  const inputs = views.scores.querySelectorAll('input');
  let idx=0;
  let gameId=0;
  for(const games of rounds){
    for(const g of games){
      const scoreA=parseInt(inputs[idx++].value,10);
      const scoreB=parseInt(inputs[idx++].value,10);
      await fetch(`http://localhost:4000/api/tournaments/${tournamentId}`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({gameId, scoreA, scoreB})
      });
      gameId++;
    }
  }
  const res = await fetch(`http://localhost:4000/api/tournaments/${tournamentId}`);
  const data = await res.json();
  renderResults(data.players.sort((a,b)=> b.wins - a.wins || b.plusMinus - a.plusMinus || a.name.localeCompare(b.name)));
  showView('results');
}

function buildScoreInputs(){
  views.scores.render();
}

function renderResults(list){
  const sample = list || playerNames.map(n=>({name:n,score:0}));
  views.results.render(sample);
}
