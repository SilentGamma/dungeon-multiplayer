# Enemy encounter update

Every standard dungeon already forces its final room before the goal to be an enemy encounter. The additional validation now checks 5,000 generated layouts across all five dungeons: the final approach is flagged correctly, actually spawns enemies on entry, and blocks the door to the safe goal until cleared.

Normal rooms keep their existing 2–5 encounter-slot budget and probabilities (60% two, 22% three, 12% four, 6% five). Each Flapper slot now spawns two individually damageable Flappers, with unique IDs and independent movement. The pair consumes one slot. Other enemy types consume one slot per enemy. Thus an all-Flapper room contains 4–10 physical enemies. Room locks count every living pair member. HP scaling remains per individual enemy.

Flapper movement decisions now occur every one second, including initial spawns, the Warden’s minions and recovery from throws. The existing forward-biased 90-degree turn pattern is unchanged. A delayed update executes only the newest turn decision, without replaying missed ticks.

Creeper damage increases from 5 to 7. Its radius increases from 0.039 to 0.0468 room units (+20% to radius and diameter); rendering and collision use that shared size. HP, movement speed, slam area, windup and stun duration are unchanged.

The Warden still spawns two physical Flappers every 15 seconds, with a maximum of six living minions, following its separate boss encounter rule.
