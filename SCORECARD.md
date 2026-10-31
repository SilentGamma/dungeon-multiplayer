# Run results

The server records per-player knockdowns (HP reaching zero), last-hit enemy kills, and real elapsed time from the host starting the run to victory or defeat. Counts persist across floors and revivals. A defeated enemy is credited once; attacks, poison, reflected hits, throws, and Joker damage identify the last attacker. Disconnections do not award a death or successful finish. Result data freezes when the run ends.

- F: did not finish, including a downed player at final victory or an abandoned run.
- S: a true solo run finishes deathless within 10:00; multiplayer retains the deathless-completion rule.
- A: other finishes within the party-adjusted pace target (provisional), including solo finishes above 10:00 through 12:00.
- B: other successful finishes.

Party adjustment uses a provisional 60% traversal / 40% combat time model. The traversal share does not change with party size. Combat time scales with the actual enemy-health multiplier divided by the number of present players, so eight attackers do not receive the same time budget as one when enemy HP is only 2.2 times solo HP. The server integrates solo-equivalent elapsed time throughout the run, using the present party and the current floor's fixed difficulty. Downed but revivable players still count as present; going down cannot make the pace target easier. Departures only affect future time, never retroactively rewrite earlier effort. Raw play time is still displayed; a separate adjusted A target is shown for transparency. Kills and role choice never gate ranks.

For unchanged parties, the approximate A targets are 1: 12:00, 2: 10:19, 3: 9:17, 4: 9:07, 5: 8:44, 6: 8:43, 7: 8:30, 8: 8:31. Small differences at health-scaling pair boundaries reflect the existing difficulty steps. These are provisional model values, not evidence of calibrated equal difficulty. The 12-minute solo baseline and 60/40 weights need completion data by party size to validate fairness.

A run that starts with one player now needs a deathless completion within a provisional 10-minute limit for S. Solo A remains available through 12 minutes, then B for slower wins. Classification is fixed at run start: multiplayer departures never reclassify a run as solo. Raw wall time includes pauses and transitions. Existing GOLD unlocks are retained. This 10-minute target is a starting design value and needs timed completion data across roles; it is not a measured percentile.

Speed threshold is configurable in server/scoring.mjs and should be calibrated against real completed-run playtest data. S has priority over A. Enemy count is personal, not party-wide.

The original CSS/SVG parchment result card slams onto the final gameplay frame and is pinned by an arrow at the top center. It stays until the player chooses to leave. Reduced-motion preferences disable the slam animation.

Flapper: a shielded bite consumes shield but applies no poison, including a bite that breaks the shield. Existing poison is not cured by raising a shield.

Expressions: attack blink is 180 ms; shield holds the closed-eye state. Hit flashes stay solid white; other effects tint existing player artwork at 55% effect color. Enemies retain their ink details under colored effects.
