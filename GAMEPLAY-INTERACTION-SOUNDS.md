# Pots and interaction audio

Goal rooms, like start rooms, never generate pots. Direct player attacks now break pots in their actual attack shape with wall occlusion; props do not consume a single-target enemy hit. Wrestler can still grab and throw intact pots. Only Wrestler and Joker may launch pots through throw mechanics. Broken pots are removed on the simulation tick.

Original, cached procedural cues now cover button/menu navigation, role browsing, item pickups, launching, shields, damage/downing, healing/reviving, reaching the goal, dungeon transitions, victory and defeat, and breaking pots. Existing attack recordings remain unchanged. Local UI and outcome cues require no network event. Nearby world cues use the existing bounded, expiring, per-viewer event stream, with duplicate suppression. All sounds respect Sound off and the shared 12-voice cap; playback requires a user gesture. Ordinary movement and sustained reviving do not create continuous loops.
