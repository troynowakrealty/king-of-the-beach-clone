# King of the Beach Backend

Simple Node.js backend using the built-in `http` module. Data is stored in `data/db.json`.

## Usage

```bash
node src/index.js
```

This starts the server on port 4000 with the following endpoints:

- `GET /api/health` – returns `{"status":"ok"}`
- `POST /api/tournaments` – body `{name, players[]}`; returns tournament id and schedule
- `GET /api/tournaments/:id` – returns tournament data
- `POST /api/tournaments/:id` – body `{gameId, scoreA, scoreB}` to record scores

## Development

The server automatically saves tournaments to `data/db.json`.
