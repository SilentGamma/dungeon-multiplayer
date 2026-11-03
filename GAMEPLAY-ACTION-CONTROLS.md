## Instant movement and player health — 2026-11-02

Click or tap open gameplay canvas space to immediately aim and launch toward that screen point. Holding, dragging and releasing the movement pointer no longer changes the trajectory. UI controls remain separate. Camera offset, canvas position and boss-arena zoom are included in the target calculation. Clicking directly on the player is ignored. Movement retains the 0.2-second steering cooldown and existing bounce/collision behavior; it does not pathfind around walls. Space / Action tap attacks and held shields keep their existing controls; movement taps cannot interrupt a held action or Wrestler state.

One atomic, sequenced launch message is used for desktop, mobile, WebSocket and HTTP fallback, so packet reordering cannot strand an aim hold. Prediction mirrors server direction and speed. Stale/duplicate/wrong-floor packets and invalid angles are rejected. A movement click can cancel a revive normally.

Every player role has a 20% base/max HP buff rounded upward to whole HP: Brawler 15, Perfumer 12, Dancer 15, Brute 20, Chef 15, Sniper 12, Wrestler 17, Joker 10. Ability-healing caps also round upward so healing cannot introduce fractional HP. Fresh runs, subsequent floors and the boss round use the same shared stats. Damage, shields and healing pickup amounts are unchanged.

Validation: instant-control and camera-target tests, prediction parity, cooldown and invalid-input cases, mobile pointer/touch fallback, HTTP/WebSocket two-player launches, all-role/all-floor health, existing attack/shield/chat tests and full game regressions.

Earlier entries below describe prior controls.

# Action controls

The mobile button is labelled Action. The same timing applies to Space on desktop.

For normal roles, releasing before 0.2 seconds performs the existing attack. No shield is raised during a tap. Holding for 0.2 seconds raises the shield if any shield points remain. Releasing after that hold lowers the shield without attacking. Cancelling never attacks. Attack damage, geometry, active windows and cooldowns remain unchanged. A client hold-duration hint can suppress an accidental tap when press/release packets arrive together; it cannot enable an attack after the server raised a shield.

Wrestler keeps his immediate lunge/grab. He starts without the shield, which raises after the same 0.2-second hold. Holding past a missed lunge keeps him stationary and shielding; releasing lowers it without another attack. Orbit and release-to-throw behavior remain. Sniper keeps his rectangle and slow held scope rotation; a long shield hold does not fire, while a tap does.

Initial aim-and-launch movement remains unchanged. Movement aiming stays on the room canvas. Shield regeneration still requires actual movement.

Joker Shock stuns nearby eligible allies and enemies for 4 seconds, preserving its radius and protection rules. Throw stun and other stun durations are unchanged.
