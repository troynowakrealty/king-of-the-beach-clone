import "./styles.css";
import { useState } from "react";

export default function App() {
  const [step, setStep] = useState("count");
  const [count, setCount] = useState(4);
  const [names, setNames] = useState([]);
  const [schedule, setSchedule] = useState([]);

  const handleGenerate = () => {
    const players = names;
    const games = [];

    if (count === 4) {
      games.push({ teams: [[players[0], players[3]], [players[1], players[2]]] });
      games.push({ teams: [[players[0], players[1]], [players[2], players[3]]] });
      games.push({ teams: [[players[0], players[2]], [players[1], players[3]]] });
    } else {
      games.push({ teams: [["Not yet", "Implemented"], ["-", "-"]] });
    }
    setSchedule(games);
    setStep("schedule");
  };

  if (step === "count") {
    return (
      <div className="App">
        <h2>How many players?</h2>
        {[4, 5, 6, 7, 8].map((n) => (
          <button key={n} onClick={() => { setCount(n); setNames(Array(n).fill("")); setStep("names"); }}>{n}</button>
        ))}
      </div>
    );
  }

  if (step === "names") {
    return (
      <div className="App">
        <h2>Enter player names</h2>
        {names.map((name, idx) => (
          <input key={idx} placeholder={`Player ${idx + 1}`} value={name} onChange={(e) => { const copy = [...names]; copy[idx] = e.target.value; setNames(copy); }} />
        ))}
        <br />
        <button onClick={handleGenerate} disabled={names.some((n) => !n)}>Create Schedule</button>
      </div>
    );
  }

  return (
    <div className="App">
      <h2>Schedule</h2>
      {schedule.map((g, i) => (
        <div key={i}>
          <strong>Game {i + 1}</strong>: {g.teams[0][0]} &amp; {g.teams[0][1]} vs {g.teams[1][0]} &amp; {g.teams[1][1]}
        </div>
      ))}
      <button onClick={() => setStep("count")}>Restart</button>
    </div>
  );
}