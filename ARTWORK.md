# Character artwork

Polished from the user's original notebook sketches using the built-in image-generation tool. Eight square selection portraits and eight transparent circular tokens use strict monochrome shades of each role’s identifying color, including skin, hair, lips and eyes. Gameplay uses the original collision rules. The displayed player radius is 0.026 room units, matching Normal enemies, while the collision radius remains 0.0196875 (about 32% larger display only).

## Final assets

Assets are saved in `server/public/` in this repository. Portraits are 512 × 512 WebP; tokens are 128 × 128 WebP with alpha transparency. Tokens are preloaded once in the lobby, reused across frames, and served with immutable caching. Original generated PNGs remain in the image-generation outputs.

| Role | Color | Portrait | Token |
|---|---|---|---|
| brawler | coral peach #ffad83 | brawler-portrait-v4.webp | brawler-token-v3.webp |
| chef | mint green #99efb1 | chef-portrait-v4.webp | chef-token-v3.webp |
| wrestler | teal cyan #79e2e4 | wrestler-portrait-v3.webp | wrestler-token-v3.webp |
| joker | green lime #a9e64b | joker-portrait-v4.webp | joker-token-v2.webp |
| brute | gold #ffcf78 | brute-portrait-v3.webp | brute-token-v1.webp |
| sniper | blue #9ebdff | sniper-portrait-v3.webp | sniper-token-v3.webp |
| perfumer | purple #d8b1ff | perfumer-portrait-v1.webp | perfumer-token-v1.webp |
| dancer | pink #fca1bd | dancer-portrait-v3.webp | dancer-token-v1.webp |

## Original portrait prompts (v1)

Reference image: the user's original notebook photograph. Each prompt isolates the specified portrait and ignores the other panels and bottom-row tokens.

### brawler

Use case: sketch-to-render. Edit target: the attached photograph of the user's original game-character sketches. Create ONE polished square character-selection PORTRAIT of Brawler, upper-left sketch. Shaggy layered hair with a rear ponytail, heavy bangs covering one eye, visible narrowed eye, angry open mouth, shoulders and a hand held across the chest. Preserve this pose, face, hair silhouette and youthful androgynous appearance. Ignore all other panels and bottom-row tokens for this output. Preserve the user's design, not a redesign. Style: bold expressive cartoon ink illustration, clean confident outlines, strong graphic cel shading with subtle crosshatching, professional indie-game character art. Color palette: strictly monochromatic coral peach #ffad83; shadows in very dark coral-brown, coral midtones and pale peach highlights; no other hues. Strong value contrast between near-black contours/shadows, rich colored middle tones and crisp light highlights; avoid washed-out pastel rendering. Square 1024x1024 composition, head and upper shoulders fill the frame comfortably with a small safe margin, uncluttered very dark same-hue backdrop with a restrained graphic halo. Crisp face readable at 160px. No notebook paper, photograph texture, text, labels, frame, logos or watermark. Deliver only the final single portrait.

### chef

Use case: sketch-to-render. Edit target: the attached photograph of the user's original game-character sketches. Create ONE polished square character-selection PORTRAIT of Chef, upper-right sketch. Broad round face, very large round eyes, big bulbous oval nose, massive flared handlebar moustache, tall angular chef headwear cropped at top, friendly oddball expression. Preserve the distinctive proportions, face and moustache silhouette. Ignore all other panels and bottom-row tokens for this output. Preserve the user's design, not a redesign. Style: bold expressive cartoon ink illustration, clean confident outlines, strong graphic cel shading with subtle crosshatching, professional indie-game character art. Color palette: strictly monochromatic mint green #99efb1; very dark forest-green shadows, emerald midtones and pale mint highlights; no other hues. Strong value contrast between near-black contours/shadows, rich colored middle tones and crisp light highlights; avoid washed-out pastel rendering. Square 1024x1024 composition, head and upper shoulders fill the frame comfortably with a small safe margin, uncluttered very dark same-hue backdrop with a restrained graphic halo. Crisp face readable at 160px. No notebook paper, photograph texture, text, labels, frame, logos or watermark. Deliver only the final single portrait.

### wrestler

Use case: sketch-to-render. Edit target: the attached photograph of the user's original game-character sketches. Create ONE polished square character-selection PORTRAIT of Wrestler, lower-left portrait sketch. Square masculine face, stern eyebrows and expressive round eyes, strong long blocky nose, short pointed mohawk/chevron hair tuft, huge dark angular moustache/beard framing a clenched-teeth mouth. Preserve this unmistakable angular face and determined expression. Ignore all other panels and bottom-row tokens for this output. Preserve the user's design, not a redesign. Style: bold expressive cartoon ink illustration, clean confident outlines, strong graphic cel shading with subtle crosshatching, professional indie-game character art. Color palette: strictly monochromatic teal cyan #79e2e4; very dark teal shadows, saturated teal midtones and pale icy cyan highlights; no other hues. Strong value contrast between near-black contours/shadows, rich colored middle tones and crisp light highlights; avoid washed-out pastel rendering. Square 1024x1024 composition, head and upper shoulders fill the frame comfortably with a small safe margin, uncluttered very dark same-hue backdrop with a restrained graphic halo. Crisp face readable at 160px. No notebook paper, photograph texture, text, labels, frame, logos or watermark. Deliver only the final single portrait.

### joker

Use case: sketch-to-render. Edit target: the attached photograph of the user's original game-character sketches. Create ONE polished square character-selection PORTRAIT of Joker, lower-right portrait sketch. Long asymmetrical cartoon face, one larger eye, bulbous nose, swept quiff on the left and curved jester-cap tip with a tiny bell on the right, enormous mischievous toothy grin and pointed chin. Preserve the drawing's expression and face. This is the user's original jester character, no franchise imagery or clown makeup. Ignore all other panels and bottom-row tokens for this output. Preserve the user's design, not a redesign. Style: bold expressive cartoon ink illustration, clean confident outlines, strong graphic cel shading with subtle crosshatching, professional indie-game character art. Color palette: strictly monochromatic lime yellow-green #e1ea82; near-black olive shadows, lime midtones and pale yellow-green highlights; no other hues. Strong value contrast between near-black contours/shadows, rich colored middle tones and crisp light highlights; avoid washed-out pastel rendering. Square 1024x1024 composition, head and upper shoulders fill the frame comfortably with a small safe margin, uncluttered very dark same-hue backdrop with a restrained graphic halo. Crisp face readable at 160px. No notebook paper, photograph texture, text, labels, frame, logos or watermark. Deliver only the final single portrait.

## Original token prompts (v1)

Reference image 1: the notebook photograph. Reference image 2: the corresponding polished portrait. Genuine alpha transparency requested outside each circular token.

### brawler

Use case: sketch-to-render. Asset type: tiny circular in-game player TOKEN for brawler. Image 1 is the user's original drawing; edit specifically first bottom-row circle: a round face with jagged shaggy bangs sweeping over the forehead and angry slanted eyes; keep the very minimal face with no prominent mouth. Image 2 supplies the polished character identity and monochromatic palette only. Create ONE circular face icon, not a portrait bust. Faithfully clean up the user's bottom-row token design. Strict monochromatic palette: coral #ffad83, dark coral-brown ink, pale peach highlights; no additional hues. Bold dark ink shapes, very high contrast, simple cel-shaded fills, crisp thick features that remain instantly readable at 24 pixels. Use at most 3 tonal values plus ink; no crosshatching, no tiny texture. Entire face stays inside a perfect circle occupying 96% of the square canvas, centered, with a thin dark circular perimeter. The circle interior is opaque role color. Actual transparent background outside the circular icon, no cast shadow, no text, no labels, no UI mockup, no extra icons. Square 1024x1024 asset.

### chef

Use case: sketch-to-render. Asset type: tiny circular in-game player TOKEN for chef. Image 1 is the user's original drawing; edit specifically second bottom-row circle: round face with two dot eyes, a large broad rounded nose, a curled handlebar moustache across the lower half and a little friendly mouth. Image 2 supplies the polished character identity and monochromatic palette only. Create ONE circular face icon, not a portrait bust. Faithfully clean up the user's bottom-row token design. Strict monochromatic palette: mint green #99efb1, dark pine-green ink, pale mint highlights; no additional hues. Bold dark ink shapes, very high contrast, simple cel-shaded fills, crisp thick features that remain instantly readable at 24 pixels. Use at most 3 tonal values plus ink; no crosshatching, no tiny texture. Entire face stays inside a perfect circle occupying 96% of the square canvas, centered, with a thin dark circular perimeter. The circle interior is opaque role color. Actual transparent background outside the circular icon, no cast shadow, no text, no labels, no UI mockup, no extra icons. Square 1024x1024 asset.

### wrestler

Use case: sketch-to-render. Asset type: tiny circular in-game player TOKEN for wrestler. Image 1 is the user's original drawing; edit specifically third bottom-row circle: round face with fierce angled eyebrows, a strong blocky nose and a large angular moustache/beard surrounding gritted teeth. Image 2 supplies the polished character identity and monochromatic palette only. Create ONE circular face icon, not a portrait bust. Faithfully clean up the user's bottom-row token design. Strict monochromatic palette: teal cyan #79e2e4, near-black teal ink, pale icy teal highlights; no additional hues. Bold dark ink shapes, very high contrast, simple cel-shaded fills, crisp thick features that remain instantly readable at 24 pixels. Use at most 3 tonal values plus ink; no crosshatching, no tiny texture. Entire face stays inside a perfect circle occupying 96% of the square canvas, centered, with a thin dark circular perimeter. The circle interior is opaque role color. Actual transparent background outside the circular icon, no cast shadow, no text, no labels, no UI mockup, no extra icons. Square 1024x1024 asset.

### joker

Use case: sketch-to-render. Asset type: tiny circular in-game player TOKEN for joker. Image 1 is the user's original drawing; edit specifically fourth bottom-row circle: a simple round face with two tiny eyes and raised brows, an enormous dark mischievous triangular grin with bright chunky teeth; preserve the very simple smile-token silhouette rather than a full jester portrait. Image 2 supplies the polished character identity and monochromatic palette only. Create ONE circular face icon, not a portrait bust. Faithfully clean up the user's bottom-row token design. Strict monochromatic palette: lime yellow-green #e1ea82, near-black olive ink, pale yellow-green highlights; no additional hues. Bold dark ink shapes, very high contrast, simple cel-shaded fills, crisp thick features that remain instantly readable at 24 pixels. Use at most 3 tonal values plus ink; no crosshatching, no tiny texture. Entire face stays inside a perfect circle occupying 96% of the square canvas, centered, with a thin dark circular perimeter. The circle interior is opaque role color. Actual transparent background outside the circular icon, no cast shadow, no text, no labels, no UI mockup, no extra icons. Square 1024x1024 asset.

## Readability revision (v2)

Built-in image generation was used to edit all four portraits and all four tokens. The first Brawler redesign was retained; the subsequent shading finish was used as the style reference across the four portraits. Brawler retains the selected first redesign's angular face and eye, female identity, shaggy bangs and ponytail, with the revised graphic shading. Joker is greener lime (#a9e64b) with exactly one visible upper tooth. Tokens use flat role-color fills and dark bold features, without rendered highlights, shadows, gloss or fine hatching. The source references were the corresponding v1 generated assets.

The displayed token diameter matches a Normal enemy, about 32% larger than before. This display-only radius does not alter collision, shield, attack, movement, door or enemy statistics.

Full selected revision prompt set: [ARTWORK-v2-prompts.md](ARTWORK-v2-prompts.md).

## Minimal token revision (v3)

Brawler, Chef, and Wrestler tokens now match the unchanged Joker token with sparse facial features, bold shapes and consistent circular framing. Selection portraits are unchanged. Final built-in generation prompts and saved asset paths: [ARTWORK-v3-prompts.md](ARTWORK-v3-prompts.md).

## Remaining cast

Brute, Sniper, Perfumer and Dancer were polished from the second user sketch sheet, including its bottom-row token designs. Brute’s jagged mass is her weapon. All four portraits follow the established cel shading; all four tokens follow Joker’s minimal graphic style. [Final prompts and saved asset paths](ARTWORK-remaining-prompts.md).

## Natural skin and hair revision

Six portraits now use natural skin tones and varied facial features and hair textures, following the user’s direction: Hawaiian-inspired Chef, mixed-heritage-inspired Perfumer, European-inspired Dancer and Japanese Brawler. Brute has straight shoulder-length dark hair, and her weapon remains behind her. Joker retains his one tooth and lime costume. Sniper’s portrait and token have centered visor reticles. Wrestler and the other minimal role-color tokens are unchanged. [Final built-in generation prompts and saved paths](ARTWORK-natural-colors-prompts.md).

## Current monochrome cast

This revision supersedes the natural-color palette: every selected portrait and token is monochrome in its role color. Updated facial features and hair textures remain. Wrestler has the requested Filipino/Mexican-inspired features. Perfumer’s sweeping fringe covers one eye, with the eye visibly drawn over the hair. Sniper has a plain circular scope and retains the corrected crosshair only on the rectangular visor. Brawler and Dancer received a final contrast refinement. [Final built-in generation prompts and saved asset paths](ARTWORK-monochrome-prompts.md).

## Perfumer portrait restored

At the user’s direction, Perfumer uses her first monochrome purple portrait (perfumer-portrait-v1.webp), before the face and fringe edits. This supersedes the eye-over-hair revision for Perfumer only. The rest of the monochrome cast revision remains selected.
