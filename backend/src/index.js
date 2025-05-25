import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createServer } from 'http';
import { generateSchedule } from './lib/scheduler.js';

const DATA_PATH = new URL('../data/db.json', import.meta.url);
function load(){
  if(!existsSync(DATA_PATH)) return {tournaments:{}};
  return JSON.parse(readFileSync(DATA_PATH));
}
function save(data){
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

const db = load();

function send(res, status, obj){
  res.writeHead(status, {'Content-Type':'application/json', 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Methods':'GET,POST,DELETE,OPTIONS', 'Access-Control-Allow-Headers':'Content-Type'});
  res.end(JSON.stringify(obj));
}

createServer((req,res)=>{
  if(req.method==='OPTIONS'){ send(res,200,{}); return; }
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/api/health'){ return send(res,200,{status:'ok'}); }
  if(url.pathname==='/api/tournaments' && req.method==='POST'){
    let body='';
    req.on('data',chunk=>body+=chunk);
    req.on('end',()=>{
      const {name,players}=JSON.parse(body||'{}');
      const id=Date.now().toString();
      const schedule=generateSchedule(players);
      db.tournaments[id]={id,name,players,games:schedule};
      save(db);
      send(res,200,{id,games:schedule});
    });
    return;
  }
  const match = url.pathname.match(/^\/api\/tournaments\/(\d+)$/);
  if(match && req.method==='GET'){
    const t=db.tournaments[match[1]];
    if(!t) return send(res,404,{error:'not found'});
    return send(res,200,t);
  }
  if(match && req.method==='POST'){
    let body='';
    req.on('data',chunk=>body+=chunk);
    req.on('end',()=>{
      const {gameId,scoreA,scoreB}=JSON.parse(body||'{}');
      const t=db.tournaments[match[1]];
      if(!t) return send(res,404,{error:'not found'});
      const game = t.games.flat()[gameId];
      if(!game) return send(res,404,{error:'game not found'});
      game.scoreA=scoreA; game.scoreB=scoreB;
      // update stats
      const playerStats={};
      t.players.forEach(p=>{playerStats[p]={plusMinus:0,wins:0};});
      t.games.flat().forEach(g=>{
        if(g.scoreA==null || g.scoreB==null) return;
        const diff=g.scoreA-g.scoreB;
        g.teamA.forEach(p=>{ if(p!=='BYE') playerStats[p].plusMinus+=diff; });
        g.teamB.forEach(p=>{ if(p!=='BYE') playerStats[p].plusMinus-=diff; });
        const winTeam = g.scoreA>g.scoreB ? g.teamA : g.teamB;
        winTeam.forEach(p=>{ if(p!=='BYE') playerStats[p].wins++; });
      });
      t.players= t.players.map(p=>({name:p, plusMinus:playerStats[p].plusMinus,wins:playerStats[p].wins}));
      save(db);
      send(res,200,{status:'ok'});
    });
    return;
  }
  send(res,404,{error:'not found'});
}).listen(4000,()=>console.log('Server listening on 4000'));
