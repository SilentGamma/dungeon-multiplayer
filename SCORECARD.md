# Run results

The server records per-player knockdowns (HP reaching zero), last-hit enemy kills, and real elapsed time from the host starting the run to victory or defeat. Counts persist across floors and revivals. A defeated enemy is credited once; attacks, poison, reflected hits, throws, and Joker damage identify the last attacker. Disconnections do not award a death or successful finish. Result data freezes when the run ends.

- F: did not finish, including a downed player at final victory or an abandoned run.
- S: finished the entire game with no deaths, regardless of time.
- A: finished with deaths in 12 minutes or less (provisional target).
- B: other successful finishes.

Speed threshold is configurable in server/scoring.mjs and should be calibrated against real completed-run playtest data. S has priority over A. Enemy count is personal, not party-wide.

The original CSS/SVG parchment result card slams onto the final gameplay frame and is pinned by an arrow at the top center. It stays until the player chooses to leave. Reduced-motion preferences disable the slam animation.

Flapper: a shielded bite consumes shield but applies no poison, including a bite that breaks the shield. Existing poison is not cured by raising a shield.

Expressions: attack blink is 180 ms; shield holds the closed-eye state. Hit flashes stay solid white; other effects tint existing player artwork at 55% effect color. Enemies retain their ink details under colored effects.
