# Exclusive music and relic art

Themes switch serially: the outgoing theme fades and stops before the next starts. Musical event cues temporarily own playback and suppress background themes. A scene change, including a fight starting without another doorway crossing, cancels the previous cue. Cues wait for outgoing fades before starting. Cue completion releases the current theme, rather than restoring an old scene.

Delayed HTML audio play promises verify the current owner before continuing. Leaving clears the desired theme and fades event music. API responses and delayed entrance-cue callbacks verify the session epoch, preventing a response from an abandoned game from restoring gameplay or sound. Entrance drums are skipped when the revealed game is already in combat.

The camera is 5% closer. Exploration, locked-room and arena sight radii are each exactly 8% smaller. Locked-room visibility remains centered on the room and still includes its corners. The compass now uses the same HUD-aware camera center as the room and pointer aiming.

Original Canvas/CSS relic artwork now covers diamond-headed keys, folded parchment maps, chipped terracotta pots and shards, carved heart/wind pickups, tarnished thorns, ember projectiles and worn iron action/menu seals. Gameplay labels use old serif lettering, with the existing dyslexia toggle retained. Approved character art, role colors, action-flash meanings, collision geometry and pickup rules remain intact. New art is credited with the existing original project artwork.

Validation: full test suite; regression tests for serial themes, same-room combat entry, rapid cue replacement, leaving during scheduled playback and late play-promise completion; exact camera/radius checks; mobile/desktop game rendering; 147 real-browser audio-ownership checks with every old track stopped after leaving.
