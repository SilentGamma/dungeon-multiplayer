# Key rooms and map placement

Each of the five standard dungeons generates 1–3 key rooms. They use safe rooms, exclude the start and goal, and preserve the mandatory final enemy chamber. Selection gives rooms off the shortest goal path five times the weight of rooms on that path. The separate Warden finale has no key rooms or map.

Entering a key room locks its outgoing doors until its key is collected. Teammates may enter. Any living teammate can collect the key by contact, opening the room for everyone. It stays open after collection, including on reentry. Keys are placed in the clear axis corridors between quadrant obstacles and do not require a new input button.

Ordinary map locations must be more than three traversable room-to-room steps from the start (distance at least four). Nearby key rooms within three steps are the exception: if one exists, one of them provides the map reward. A reward map is hidden and cannot be collected until that room's key is collected, then appears at the room center. If no nearby key room exists, a distant ordinary room is preferred; a distant key room can be used as a reward fallback. Exactly one room is selected as the map location per dungeon. The map is collected once and remains shared across the team.

Key-room layout and pickup positions are sent with the initial dungeon. Compact updates carry a small collected-key bitmask. Server physics owns collection and unlocking; client prediction applies the entry lock but does not invent pickups. Existing enemy room locks remain in force independently.

Validation: 10,000 generated dungeons, 2,000 per round, using seed 20261029. Key-room counts: 3,332 layouts with one, 3,354 with two, and 3,314 with three. Of selected key rooms, 14,592 were off the goal path and 5,390 were on it (73.0% off-path). Every layout passed the key count, room eligibility, map distance/reward, one-map-location and final enemy chamber checks. Additional checks cover shared locks, reentry, map collection gating, compact-state reconstruction, predicted entry and renderer visibility.

## Key reveal update

Keys are now hidden until a teammate enters their room. A compact entered-key-room bitmask synchronizes reveal state. [Pots and goal-compass update](GAMEPLAY-POTS-AND-COMPASS.md).
