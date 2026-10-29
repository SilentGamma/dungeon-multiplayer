# Attack audio and Wrestler grabs

Wrestler drops shield immediately on grabbing any target. The shield cannot be raised while orbiting/holding it, including by continuing to hold Action. Lunge/throw timing and ordinary shield holds remain unchanged.

Every accepted player attack emits sound independently of damage/hit results. Wrestler lunge and throw each emit a physical whoosh. Walker/Flapper contact swings, Sleeper lunges, Creeper slams and Warden blasts emit at attack activation, even when they miss. Joker explosions and Shock also have distinct cues; Final Draw uses the shot on lock-on.

Original procedural Web Audio effects:

| Role | Sound |
| --- | --- |
| Brawler | Punch swish and low thud |
| Perfumer | Airy spray/hiss |
| Dancer | Fast cutting swish |
| Brute | Heavy bass impact and metal resonance |
| Chef | Pan-like metallic clank |
| Sniper | Sharp gunfire crack, low report and mechanical tail |
| Wrestler | Rush/lunge, heavier throwing swish |
| Joker | Short card-flick snap |

Sniper is an original synthesized shot, NOT the Murder Mystery 2 Sheriff recording. An independently reusable copy of that exact recording was not verified. Roblox Creator Store audio access is not proof of permission to export it into a web game. References reviewed: https://en.help.roblox.com/hc/en-us/articles/115004647846-Roblox-Terms-of-Use and https://en.help.roblox.com/hc/en-us/articles/21308223046932-Creator-Store-Terms . No third-party recording is bundled.

Sounds are generated once on the device after a user gesture and cached; no audio downloads or audio streaming. Server cues are capped at 32 recent events with a 1.2-second lifetime, proximity-filtered, and sent once per viewer. Client deduplication prevents snapshot repeats; stale sounds are dropped, 12 simultaneous voices are allowed, distance attenuates gain, and a compressor limits bursts. A Sound on/off button in the player panel saves the preference. Autoplay restrictions are respected; playback is never queued waiting for a gesture.
