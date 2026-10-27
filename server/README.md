# Server-authoritative Render prototype

Run `npm test` for session, HTTP, and two-client stream checks. Run `npm start` to start the game locally at `http://127.0.0.1:8787`. Render sets `PORT` and the process listens on the assigned interface. `server/public` contains the server-connected game client; the existing public Site remains unchanged.

The server and room state live in memory on a single process. Restarts or deployments end active sessions; multi-instance scaling requires shared room routing. Before production, test actual devices, review resource limits and add robust reconnection and persistence if desired.
