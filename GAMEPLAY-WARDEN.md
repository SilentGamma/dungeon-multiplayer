# Octagon starts and Warden finale

Players occupy fixed slots on an eight-point ring in every start room, including the finale. Missing players leave unused slots; the spacing does not stretch into a different polygon. Players are stationary until they hold to aim and release to launch. The first Space/attack-button hold aims a launch; subsequent holds use normal role controls. Canceling the initial hold does not launch.

After the original five dungeons, a separate finale loads on demand. A one-tile safe start room leads into a continuous 4×4-tile arena, without internal walls. The Warden starts at its center. Entering activates the fight and locks the exit back to the start. Players, minions, attacks and throws cross internal tile boundaries normally; enemies cannot leave the arena.

The Warden has 60 base HP, multiplied by the same additive 30% per pair of players and rounded up. It moves at 0.048 tile/second per base movement axis, bouncing at the arena boundary. Every 15 seconds it spawns up to two Flappers, capped at six living Flappers. Every eight seconds it fires four projectiles, alternating cardinal and diagonal directions. Each projectile deals 7 damage, is blocked by shield contact, and expires on impact, at the arena boundary or after ten seconds. A 0.8-second directional warning precedes a blast. At most twelve projectiles are retained. Boss defeat wins the run; a team wipe loses. It is displayed as a finale, not Dungeon 6/5.

The exact boss HP and alternating blast interpretation were implementation choices stated before development. Existing role mechanics, including throws and Joker effects, still apply to the boss.

# Network optimization reference and measurements

Agar.io is closed-source. The reference used here is community protocol documentation of older Agar.io versions, not a claim about the current production implementation:
https://github.com/dollthing/Agar.io-Protocol/blob/master/Protocol.md

Its visible-node updates describe sending names once and compact coordinate data. This build applies those ideas by sending stable name/color/type/maximum-stat metadata only on first visibility, keeping it in the client, and rounding transmitted coordinates/velocities to four decimal places. Authoritative physics keeps full precision. Existing proximity culling, prediction, interpolation and backpressure remain in place. Arena enemies are processed once per simulation step even when multiple visible tiles refer to the same shared arena. Tile bounds reuse cached objects.

Repeatable local payload benchmark: `node server/network-benchmark.mjs`. Scenario: eight nearby players, twelve enemies, thirty 10-Hz snapshots. Average serialized frame size changed from 3764.97 bytes to 2757.07 bytes, a 26.8% reduction. This measures payload size, not live network RTT. It includes boss-frame fields, even though the benchmark uses a normal dungeon.

Local stress check: eight players, 300 simulated seconds at 60 Hz, with survival forced to keep the scenario running. Maximum seven enemies (boss plus six minions), maximum five observed projectiles, approximately 539 ms total simulation work on the development host. This is not a Render production CPU measurement.

Validation includes octagon layouts for party sizes 1–8, stationary launch and cancellation, boss HP scaling, spawning and caps, alternating blasts, shield interception, arena movement/bounds, compact frame reconstruction, the real SSE transition into the finale, and renderer execution for the boss scene.
