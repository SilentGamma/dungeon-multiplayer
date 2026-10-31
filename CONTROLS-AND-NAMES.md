# Control, shield and name fixes

Quick chat returns keyboard focus to the dungeon after sending, Escape, C-toggle closing, or clicking back into play. Opening chat cancels held attack/shield input. A Space release belonging to an already canceled game hold is consumed before it can activate a chat button. Game-owned Space releases are handled even if keyboard focus moved. Chat buttons keep normal keyboard activation while the picker is open. Text entry and dialogs do not trigger combat.

On small or coarse-pointer gameplay layouts, quick chat sits below the upper-left HUD. Its width reserves the lower-right Action button's lane, including while the picker is open. This layout is independent of the attack button and does not change its hit target.

A shared shieldActive predicate requires a live player, positive shield, shielding state, both held-action flags, and no stun, pause, disconnect, revival, throw or grab. Combat, repulsion, Brute protection, projectiles, thrown-object interception, spikes and rendering use this same predicate. Invalid actions clear stale shield state. Remote snapshots now include the held attack flag so every client uses the same rule. Walking with an inactive shield cannot push, block or counter-hit enemies.

Enemy white-hit effects are based on observed health loss; old or shifted hit timestamps do not restart a damage flash. Windups and attack tells remain distinct from white hit effects.

Player names are normalized and limited to 12 Unicode characters on the server and client. Invalid names are rejected before room allocation. Allowed characters are letters, numbers, spaces, hyphens, underscores, apostrophes and periods. Invisible/control characters are rejected. Validation applies to both lobby creation and joining, including raw HTTP requests. The English profanity list checks full tokens, separator-joined forms, common number substitutions, accent/width variants, repeated-letter evasion and selected Cyrillic/Greek lookalikes. A curated severe-term root check catches embedded insults. Benign-name and identity exceptions reduce false positives. Like any offline word filter, this is not complete semantic or multilingual moderation. Quick chat remains preset-only.

Word-list source: LDNOOBW English list, © 2012–2020 Shutterstock, Inc. and contributors, https://github.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words . CC BY 4.0 license included at server/public/name-word-list-license.txt; formatting adapted to JavaScript. Credits identify the source and matching adaptations. Source entries are not repeated in player-facing error messages.

ESRB's public Ratings Guide (https://www.esrb.org/ratings-guide/) describes the Users Interact communication label. No ESRB profanity-registry integration, certification or assigned game rating is claimed. The filter is the game's own policy, implemented using the credited word list.

Validation: npm test; chat-controls, player-name, player-name-network and shield-inactive tests; desktop keyboard and 390-pixel mobile-layout browser checks. Synthetic shield fixtures now explicitly hold the action when testing active shielding.
