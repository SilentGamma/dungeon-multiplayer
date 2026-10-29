# Joker Gambit reveal

A Joker shield break broadcasts a shared center-screen GAMBIT cue. Exactly 0.2 simulation seconds later the server chooses one of the six equally likely outcomes, publishes its name and applies its existing effect immediately. The labels are KAMIKAZE, DISAPPEAR, FLOWER STORM, SHOCK, AIR RELEASE, FINAL DRAW. Results remain visible for 1.2 seconds. No changes to outcome damage, radii or durations.

The cue is global and independent of proximity entity filtering. Compact frames stop carrying expired cues. Clients suppress repeated snapshots and use at most two timers, clearing on leaving a run. Even if the first received snapshot contains a result, clients show GAMBIT for 0.2 seconds before showing its name. Gameplay effects remain server-authoritative and do not wait for client presentation/network delays. If Joker goes down, disconnects or becomes safe in the goal before the roll resolves, the pending effect is cancelled.
