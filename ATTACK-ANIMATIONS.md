# Role-colored attack animation and combat mix

| Role | Animation | Existing shape |
| --- | --- | --- |
| Brawler | Energy blast | Centered medium circle |
| Dancer | Tapping foot | Forward rectangle |
| Wrestler | Grapple | Small circle; existing lunge/catch/orbit behavior |
| Sniper | Hot shot | Long narrow rectangle |
| Brute | Mighty slam | Forward disjoint circle |
| Perfumer | Scent Spray | Long cone |
| Joker | Hand shuffle | Small cone |
| Chef | Servin’ it up | Curved cone |

The original ink-cut Canvas forms follow Leonardo Camargo's supplied attack sketches. They use each player's role color, the authoritative released attack facing and the existing active attack duration. Geometry is imported from the shared gameplay definition; artwork is clipped to that boundary. Sniper retains a stable aiming preview. Wrestler hands draw in front of the token so the small grapple gesture stays readable, with lunge/grip timing replicated to teammates. Reduced-motion mode holds a readable strike pose.

No range, damage, cooldown, target selection, collision radius, blink timing or shield rule changed.

Attacks and hits now use a dedicated compressor and calibrated output path. The saved Effects percentage remains exact: 50% stays 50%. Combat output makeup is 0.9 compared with the existing 0.3 utility master. Transient compression and a -10 dB party-burst limiter control simultaneous impacts. Music, navigation and utility sounds keep their existing paths and levels. Sniper's source recordings and pitch remain unchanged, with the new overall combat calibration applying to its shot/hit too.

Validation covers eight distinct animation forms, active frame changes, exact shared hitbox clipping, fixed facing, reduced-motion poses, remote grapple metadata, saved mixer percentages and routing, the existing combat and multiplayer suite, browser animation review, and offline browser loudness/headroom measurements at 50% including twelve simultaneous hits.
