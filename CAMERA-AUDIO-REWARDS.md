# Room framing, clear rewards and audio

The camera shows a wider area on all devices. Its viewport reserves space above for Health/Shield and below for action controls. A locked room centers immediately and uses a room-centered sight radius large enough to include all four corners. Pointer aiming uses the same framing as drawing.

Wall and Thorns moves both obstacle bands inward by one tile. Opposed Corners moves all four corner features inward by one tile. Walled Chamber moves its left wall/stub and right wall inward one tile toward the unchanged key position. Entrance sides and shared opening columns remain unchanged.

Super hearts and swift wind are rare key-room clear rewards. Both key collection and guard defeat are required. Each room rolls once, including when no reward is awarded. The rewards do not appear at floor generation or reroll on reentry. Heart drops from pots remain unchanged.

Music controls long themes and event music: castle entry, dungeon entrance drums, room-clear trumpet, goal fanfare and victory/defeat cues. Effects controls attacks, enemy actions, pots, pickups, damage, healing and revives. Menu sounds controls navigation only. Event tracks have a separate music gain bus within the sound engine. Page/floor transitions fade outgoing themes and event tracks before stopping/resetting them. New entrance music waits until the reveal. Gesture unlock cannot resume a theme during a transition.

Validation includes the full test suite; portrait and landscape viewport-fit checks; actual 390×700 mobile and 900×700 desktop game rendering; room-centered corner visibility; both key/guard clear orders; reward deduplication and rarity; all eight layouts; independent audio buses; track fade/stop/reset behavior and entry-transition navigation.

Follow-up: camera zoom is now 5% closer. All sight radii are multiplied by 0.92 (exactly 8% smaller), retaining the room-centered combat view. Themes now switch serially instead of crossfading; event music exclusively owns the music channel while playing. Scheduled cues and delayed playback cannot restart a scene after leaving. Game responses and entry-cue promises are guarded by the current session epoch.
