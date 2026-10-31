# Approved room layouts

Normal floors now use the eight approved sketch layouts: four key-room interiors and four regular-room interiors. Each room has a 9×9 drawing grid. Layout selection follows the number of connected sides; orientation follows the approach from the starting room. Interior walls, spikes, keys and Walker positions rotate together. Two adjacent connected sides use the reviewed adaptation of the opposite-door template.

Existing shared edge data still controls the exact one-, two- or three-opening columns, widths and positions. Both neighboring rooms use the same openings. The layouts do not move an entrance to another side or rewrite door gaps. Branching can produce four-sided rooms so all eight templates can appear.

Wall and Thorns has an uninterrupted seven-tile thorn line. Stone Elbow has equal five-tile arms with two-tile clearance from the room bounds. Opposed Corners uses matching one-tile insets.

Pots randomly choose zero to three occupied spaces from a hidden 5×5 placement grid. Each space holds one or two pots. The full radius plus clearance avoids walls, spikes, door approaches, keys, maps, player spawns and Walker spawns. No dots are rendered. Pots are generated once on the server and shared by all players; they do not reroll on room reentry.

Key-room Walkers spawn at the reviewed positions on first entry, with existing party health scaling. They never duplicate on reentry. Collecting the key and clearing remaining guards releases the room. Map pickups use a safe floor position when the room center is blocked. Starting rooms, stairwell goals and the boss arena retain their existing behavior.

Music defaults to 50%. Previous untouched 25% defaults migrate to 50%; saved custom settings remain available.

Validation: full test suite, all prototype rotations and door topologies, 1,000 integrated floors including all eight templates, 27,261 unchanged opening approaches, reachable keys/maps, safe enemy and pot spawns, and shared key-guard locks.
