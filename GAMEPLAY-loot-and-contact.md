# Contact damage and loot

All gameplay effects are authoritative on the server and replicated to all players. Pickups are consumed once; full-health players leave healing items for teammates.

## Damage

Enemy body contact hurts even outside an attack's active window. Attack windups still apply to the extended shield reach. Stunned, inactive, grabbed and thrown enemies remain non-attacking. A recovering thrown enemy has a 0.3-second safety window. Damage hits grant 0.8 seconds of shared invincibility, including shield interception. Existing poison continues on its own status timer.

Spikes deal 1 damage immediately on eligible contact and again each second while contact continues. Reentering does not bypass that interval or hit invincibility. Raised shields intercept spike damage as before.

## Drops

- Heart: 25% chance per broken normal pot; restores up to 1 HP.
- Super Heart: 12% chance per key room; restores up to 5 HP.
- Swift Wind: 8% chance per key room; grants 50% faster movement for 5 seconds, with white player flashes. Remaining duration carries to the next floor.
- Pot shard: 5% chance per broken normal pot, mutually exclusive with a Heart. Arms after 0.3 seconds, deals 1 damage to the first eligible player or enemy that touches it, then disappears. Can be grabbed/thrown through the existing throwable system; a thrown shard deals 1 damage on its first collision and shatters. Walls also shatter thrown shards. Shards never drop further loot.

Healing items can restore full HP. Ability-based healing remains capped at 80%; pickups do not remove poison. Neither pickup healing nor ability healing lowers existing HP.

Key-room loot uses safe, unobstructed positions away from pots, keys and other pickups. No key-room bonus loot is placed in the starting room or goal. Spawn chances are attempted once on floor generation, not on revisits or network updates. Pot loot rolls once on destruction. The game never rerolls or duplicates drops on clients.

Original Canvas heart, crowned-heart, wind and pottery-shard art follows the charcoal, ember and parchment game palette. Item art and white boost flashes are rendered inside existing visibility masks.
