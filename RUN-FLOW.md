# Run completion, pause and reconnect

Both victory and defeat retain the party, lobby code, roles and visibility. The scorecard's Return to lobby button marks that player done. Everyone returns together once all remaining members are done. Leaving or timing out removes a member from this barrier. A one-player party returns immediately after dismissing the scorecard. A new run resets scores and input sequences. When a host leaves, the next member becomes host; empty parties close.

The pause button or Escape opens a wood-grain menu. It stops voluntary movement and actions for that player, on both the server and prediction client. Enemies, teammates, hazards, damage and the game clock continue. Pause grants no protection and persists across floors. Resume continues play. Leave party requires a second, explicit confirmation; Stay cancels that confirmation. Native dialog focus containment supports keyboard use.

A broken state stream immediately stops that character's actions and movement. Reconnecting within five seconds restores the same player, with their current health and pause state. The client retries briefly; a tab reload can restore its session from tab-scoped session storage. After five seconds without a state connection, the server permanently removes that identity from the party, revokes its credential and excludes it from completion waiting. A disconnected character remains vulnerable while waiting. Repeated disconnects each receive a fresh five-second window, without stale timers from earlier attempts. Explicitly leaving is immediate and does not use the reconnect grace period.

Validation: npm test; server/run-flow.test.mjs; server/run-flow-network.test.mjs; browser preview checks for the pause button, Escape, Resume, Leave and Stay.
