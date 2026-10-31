# Gameplay sound credits

Downloaded 2026-10-29 from Mixkit's royalty-free sound-effect library.
License: Mixkit Sound Effects Free License, https://mixkit.co/license/#sfxFree

- Room clear: Trumpet fanfare (2293), shortened to 1.8 seconds with fade.
- Goal reached: Trumpet fanfare (2293), full fanfare.
  Source page: https://mixkit.co/free-sound-effects/brass/
  Asset: https://assets.mixkit.co/active_storage/sfx/2293/2293-preview.mp3
- Dungeon entry: Drum Roll (566), shortened to 2.8 seconds with fade.
  Source page: https://mixkit.co/free-sound-effects/drum/
  Asset: https://assets.mixkit.co/active_storage/sfx/566/566-preview.mp3

Menu, exploration and combat music were supplied by the project owner.
Exploration playback starts at 00:55 and returns there when looping.


## CC0 gameplay replacement — 2026-10-31

26 gameplay effect slots now use 16 short recorded mixes (under 100 KB combined). Sniper's shot and hit MP3 files and pitch remain unchanged. The newer combat-output calibration applies to all attacks and hits, including Sniper. Existing music, entry recording and Mixkit fanfares remain unchanged.

- Kenney, **Impact Sounds** and **RPG Audio**, CC0 1.0: https://kenney.nl/assets/impact-sounds and https://kenney.nl/assets/rpg-audio . Original clips and license notices obtained from https://github.com/GeorgeQLe/assets-sfx-combat at commit 9662dc1bed3b06ae753045915f9accfac044c7ce.
- EZduzziteh, **Squish Sounds Effects**, CC0 1.0: https://opengameart.org/content/squish-sounds-effects . Used squishsplat_impact.mp3 for the wet throw/collision layer.
- SomeoneCool15, **Rubber ball bouncing.mp3**, CC0 1.0: https://freesound.org/people/SomeoneCool15/sounds/423778/ . Used the public high-quality preview for the deep wall bounce.

Permission reference: https://creativecommons.org/publicdomain/zero/1.0/ . Creator confirmation for Kenney: https://kenney.nl/support .

Processing: source-silence trimming, transient layering, pitch/speed changes, filters, soft saturation, headroom normalization, and short fades. The decoded MP3 outputs were checked for finite samples, audible signal and no clipping. Light movement sweeps and rubber bounces are quiet; role/enemy attacks retain distinct weights and pitches. Thrown impacts now have an assigned wet splat instead of an unrecognized audio event. New movement/bounce sounds come from authoritative simulation, never client prediction.

Full original filenames, source/output SHA-256 hashes, layer recipes and durations are in `server/public/sfx-manifest.json`. Browser credits link `server/public/sfx-licenses.txt`. Rebuild with `python scripts/build-sfx.py /path/to/sfx-sources`; that directory contains the pinned Kenney mirror, squishsplat_impact.mp3 and rubber-bounce.mp3.

Combat mix update: attacks, damage, shield hits, explosions, thrown impacts and pot breaks now use a dedicated transient compressor, stronger output calibration and a party-burst limiter. Music, navigation, utility foley and saved slider values retain their existing levels. Source recordings are unchanged.
