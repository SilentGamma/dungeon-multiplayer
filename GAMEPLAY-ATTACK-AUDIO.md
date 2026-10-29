# Attack audio and Wrestler grabs

Wrestler drops shield immediately on grabbing any target. The shield cannot be raised while orbiting/holding it, including by continuing to hold Action. Lunge/throw timing and ordinary shield holds remain unchanged.

Every accepted player attack emits sound independently of damage/hit results. Wrestler lunge and throw each emit a physical whoosh. Walker/Flapper contact swings, Sleeper lunges, Creeper slams and Warden blasts emit at attack activation, even when they miss. Joker explosions and Shock also have distinct cues; Final Draw uses the shot on lock-on.

Role sound mapping (Sniper uses the supplied recordings):

| Role | Sound |
| --- | --- |
| Brawler | Punch swish and low thud |
| Perfumer | Airy spray/hiss |
| Dancer | Fast cutting swish |
| Brute | Heavy bass impact and metal resonance |
| Chef | Pan-like metallic clank |
| Sniper | Supplied MM2 fire clip on every shot, plus supplied hit clip on enemy contact |
| Wrestler | Rush/lunge, heavier throwing swish |
| Joker | Short card-flick snap |

The user supplied these source recordings, downloaded unchanged from their page download links:

- Fire: https://www.myinstants.com/en/instant/mm2-shooting-fire-79703/ → `server/public/sniper-fire-v1.mp3` (67,998 bytes).
- Hit: https://www.myinstants.com/en/instant/mm2-hit-shooting-54069/ → `server/public/sniper-hit-v1.mp3` (75,606 bytes).

Source pages credit uploader num3. This is source attribution, not a claim of licensing clearance. The previous original Sniper shot remains a fallback if a recording cannot load/decode. The fire recording plays for hits and misses; the hit recording plays only once on successful Sniper enemy contact.

Other effects are generated once on the device after a user gesture. The two Sniper MP3s preload once and decode once, with immutable HTTP caching; there is no per-attack download or audio streaming. Server cues are capped at 32 recent events with a 1.2-second lifetime, proximity-filtered, and sent once per viewer. Client deduplication prevents snapshot repeats; stale sounds are dropped, 12 simultaneous voices are allowed, distance attenuates gain, and a compressor limits bursts. A Sound on/off button in the player panel saves the preference. Autoplay restrictions are respected; playback is never queued waiting for a gesture.
