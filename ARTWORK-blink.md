# Action expressions and icon cleanup

Built-in OpenAI image-generation tool used in precise-object-edit mode on the original role tokens. Artwork derives from Leonardo Camargo's original character sketches, as credited in the game.

## Final project assets

All assets live in server/public/ and are 128 × 128 WebP with alpha transparency.

| Role | Normal token | Closed-eye token |
|---|---|---|
| Brawler | brawler-token-v5.webp | brawler-blink-v1.webp |
| Chef | chef-token-v6.webp | chef-blink-v1.webp |
| Wrestler | wrestler-token-v5.webp | wrestler-blink-v1.webp |
| Brute | brute-token-v3.webp | brute-blink-v2.webp |
| Perfumer | perfumer-token-v2.webp | perfumer-blink-v2.webp |
| Dancer | dancer-token-v1.webp | dancer-blink-v1.webp |
| Joker | joker-token-v2.webp | joker-blink-v2.webp |
| Sniper | sniper-token-v4.webp | none (eyes concealed) |

## Edit prompts

Common invariants: preserve the character, monochrome palette, circular badge, thick rim, hair/hat, brows and unaffected features; transparent exterior, no text or extra imagery. Close eyes with clean eyelid curves and no pupils. One asset per edit.

- Chef normal: remove all mouth shapes, retaining the nose and moustache; remove the stray red diagonal mark; keep eyes open.
- Chef closed: same mouth and red-mark removal; close both eyes.
- Brawler: close both eyes; retain fierce brows and mouthless face.
- Wrestler: close eyes; retain mohawk, beard and gritted teeth.
- Brute normal: make the scar-crossed left eye solid rather than a donut-shaped hole; remove stray dirty pixels; keep eyes open.
- Brute closed: replace the eye ring with a closed eyelid crossed by the scar; remove the broad lower-face smudge; uniform flat gold fill.
- Perfumer normal: remove stray pixels and smudges; keep visible eye open, covered eye hidden, and retain hair and crisp nose.
- Perfumer closed: close visible eye; remove the blurry upper-right forehead patch, retain hair and crisp nose; uniform purple fill.
- Dancer: close eyes; preserve brows and smile.
- Joker: close eyes; preserve grin and center tooth/tongue shape; remove all smudges and blurry face shading.

Cleanup passes explicitly request flat two-color ink, no gradients, shading, smudges, blur or texture. Original imagegen PNGs remain untouched; final images are resized/encoded to WebP for the game.

## Runtime

Closed eyes start when the authoritative attack hitbox activates (or Wrestler lunge starts), last two seconds, and do not restart from repeated network frames. Holding an active shield keeps eyes closed. Sniper is excluded. Status-color flashes remain solid and take rendering precedence. A new round and disconnect clear expression timers. Both token variants preload once and reuse cached images; fallback is the normal icon if an expression is still loading.
