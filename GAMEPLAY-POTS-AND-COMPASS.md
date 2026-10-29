# Key reveal, goal compass and pots

Keys remain hidden until a teammate physically enters their key room. The entered-room bit persists for the dungeon, matching the shared spawn behavior of enemy encounters. Entering still locks the room, and collecting the key still opens it for everyone. Sending a pot through a doorway does not activate an encounter or reveal a key.

After map collection, the blinking yellow compass points directly at the goal room's center. It does not compute a route or point toward a doorway, so approaching a door cannot reverse the pointer. It is drawn as an overlay outside room/fog clipping, keeping it visible beside walls. The compass disappears for downed or arrived players, as before.

Normal rooms can generate 0–4 pots, including start and goal rooms. Placement avoids players, map and key pickups, goal circles, obstacles and room boundaries. The large Warden arena is treated as one logical room for its 0–4-pot budget; its start room has its own budget.

Pots are separate, nonblocking props and do not count toward enemy limits or room clearing. Ordinary attacks knock them into a throw. Wrestler can grab, revolve and throw them. Direct attacks do not subtract pot HP. A thrown pot breaks on a room wall, wall obstacle, another pot, player or enemy. Entity impacts use the existing 5-point throw damage and shield rules; the thrower is immune to their own pot. A pot that slows to a stop without impact remains intact. Single-target roles hit only the closest eligible target, including pots; hitting a pot does not trigger Perfumer's enemy-hit healing.

Props use the same proximity filtering, compact position/velocity updates and snapshot interpolation as other moving entities. Broken pots and their render/cache entries are removed. A standard generated dungeon has at most 60 pots; the separate finale has at most eight. Pots replace no enemy slots and do not activate room spawns when thrown across doors.

Validation covers 500 generated dungeon layouts, key reveal before/after entry, direct compass targets on both sides of room boundaries, attack and Wrestler throws, safe stopping, wall/obstacle/entity impacts, shields, owner immunity, pot-to-pot impacts, doorway entry, metadata reconstruction, object removal and rendering.
