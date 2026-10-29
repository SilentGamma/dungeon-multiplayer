# Action controls

The mobile button is labelled Action. The same timing applies to Space on desktop.

For normal roles, releasing before 0.2 seconds performs the existing attack. No shield is raised during a tap. Holding for 0.2 seconds raises the shield if any shield points remain. Releasing after that hold lowers the shield without attacking. Cancelling never attacks. Attack damage, geometry, active windows and cooldowns remain unchanged. A client hold-duration hint can suppress an accidental tap when press/release packets arrive together; it cannot enable an attack after the server raised a shield.

Wrestler keeps his immediate lunge/grab. He starts without the shield, which raises after the same 0.2-second hold. Holding past a missed lunge keeps him stationary and shielding; releasing lowers it without another attack. Orbit and release-to-throw behavior remain. Sniper keeps his rectangle and slow held scope rotation; a long shield hold does not fire, while a tap does.

Initial aim-and-launch movement remains unchanged. Movement aiming stays on the room canvas. Shield regeneration still requires actual movement.

Joker Shock stuns nearby eligible allies and enemies for 4 seconds, preserving its radius and protection rules. Throw stun and other stun durations are unchanged.
