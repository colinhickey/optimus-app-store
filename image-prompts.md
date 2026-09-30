# Image Prompts

Prompts for the new artwork. Generate these elsewhere, drop the files into `images/` using the filenames given, and the site will pick them up.

## Shared style block

Append this to every app prompt so the new images match each other and the existing set:

> Photorealistic, cinematic lighting, shallow depth of field, shot on a full-frame camera with a 35mm lens. The robot is a sleek humanoid with a glossy white polymer body shell, dark graphite joints, articulated metal hands and a smooth, featureless, glossy black glass face visor. No logos, no text, no watermarks. Square 1:1 composition with the robot as the clear subject, slightly off-centre, with room around it.

Leaving out logos keeps the images clean and avoids trademark issues. The parody works on its own without them.

---

## 1. Hero: the intro zoom (most important)

The intro scrolls the camera **through the black visor** into Optimus's mind. For that to stay sharp, the image needs to be very high resolution, and the visor needs to be large and cleanly lit.

**Filename:** `images/hero-optimus.jpg` (landscape) and, optionally, `images/hero-optimus-portrait.jpg` (portrait, used on phones)

**Requirements:**
- **Resolution:** landscape at least 3840×2160 (upscale if your generator makes smaller images); portrait at least 2160×3840.
- **Visor:** smooth, uninterrupted, glossy black with no eyes, lights or text on it. It is what the zoom passes through.
- **Head position:** centred horizontally, in the upper-middle of the frame (the visor centre roughly 35–40% down from the top).
- **Background:** pure black, fading smoothly to black at every edge so the image can be cropped for any screen shape.

**Prompt (landscape):**
> A dramatic, high-end studio portrait of a sleek humanoid robot, head and upper torso, facing the camera straight on against a pure black void. The robot has a glossy white polymer body shell, a dark knitted graphite fabric neck and shoulder section, and a smooth, featureless, glossy black glass face visor shaped like an elongated egg. A single soft key light from above and slightly to the left creates a crisp curved specular highlight across the top of the visor and a thin rim light along the shoulders; the rest of the scene falls off into total darkness. The head is centred horizontally and sits in the upper-middle of the frame, the visor large and prominent. Moody, minimal, premium product-launch photography, ultra sharp detail on the visor surface, subtle reflections. No logos, no text. 16:9, 8K detail.

**Prompt (portrait variant):** use the same prompt, replace "16:9" with "9:16 vertical", and add: "framed from mid-chest up, with generous black space above the head".

**Once you have it:** tell me the filename, and I'll measure the visor position and plug it into the intro config.

---

## 2. Share image

**Filename:** `images/og-image.jpg` (1200×630). This is the preview that appears when the link is shared on social media or in messages.

> A wide cinematic banner of a sleek humanoid robot with a glossy white shell and a glossy black glass visor, shown from the chest up on the right third of the frame, head tilted slightly as if thinking. Faint glowing violet and red neural network filaments and floating translucent app-store-style tiles drift out of the back of its head into the dark space on the left. Deep black background, premium tech keynote aesthetic, photorealistic. Leave the left half mostly empty for a title overlay. No logos, no text. 1.91:1 aspect ratio.

---

## 3. New apps

Each prompt below has the shared style block appended. The suggested name and pitch are included so the image fits the joke. I'll write the full store copy for each.

### Happy Little Trees — `images/happy-little-trees.jpeg`
*Paint like a legendary TV painter. Every mistake is a happy accident.*
> The humanoid robot wearing a voluminous curly brown afro wig and an open-collared denim shirt, standing at an easel in a cosy 1980s TV studio, painting a serene mountain landscape with a palette knife. A small squirrel sits on its shoulder. Warm soft studio lighting, dark background behind the easel.

### Spark Joy — `images/spark-joy.jpeg`
*Declutters your home and thanks each item before throwing it out.*
> The humanoid robot kneeling on the floor of a bright, minimalist Scandinavian bedroom, holding up a single old sock with both hands and bowing its head to it respectfully. Neatly folded clothes stand upright in open drawers beside it. Soft morning window light, calm and serene.

### Jeeves — `images/jeeves.jpeg`
*A very English butler. Very discreet. Irons your newspaper.*
> The humanoid robot dressed as an immaculate English butler in a black tailcoat, white gloves and a bow tie, standing upright in the grand hallway of a stately home, holding a silver tray with a single cup of tea and a folded newspaper. Oil paintings and wood panelling behind, warm chandelier light.

### Flat-Pack Assembler — `images/flat-pack.jpeg`
*Builds any flat-pack furniture in minutes. Never has leftover screws.*
> The humanoid robot sitting cross-legged on a living room floor surrounded by neatly arranged furniture panels, cardboard boxes and tiny labelled piles of screws and dowels, holding an Allen key with calm precision. A partly assembled bookshelf stands beside it. Bright natural daylight, a slightly chaotic but organised scene.

### Queue Stander — `images/queue-stander.jpeg`
*Stands in line for you. Concert tickets, new phones, the post office.*
> The humanoid robot standing patiently in a long queue of people outside a shop at dawn, wearing a woolly bobble hat and holding a folding camping chair and a thermos flask. The people around it are wrapped in blankets and look tired; the robot looks perfectly alert. Cold blue early-morning light, city street.

### Centre Court — `images/centre-court.jpeg`
*A tireless tennis sparring partner. Returns everything. Never gloats.*
> The humanoid robot wearing an all-white tennis outfit and a white sweatband, mid-swing with a racket on an immaculate grass tennis court, the ball a crisp blur. Green and purple court surrounds in the background, bright summer sunlight, dynamic sports photography with motion.

### Sommelier — `images/sommelier.jpeg`
*A trained palate for your dinner parties. Cannot drink, will judge.*
> The humanoid robot in a waistcoat with a silver tastevin pendant around its neck, holding a glass of red wine up to candlelight and studying it intently, in an elegant, dim wine cellar lined with dusty bottles. Warm candlelight, moody fine-dining atmosphere.

### Wedding DJ — `images/wedding-dj.jpeg`
*Reads the room. Knows exactly when to play the classics.*
> The humanoid robot behind a DJ deck at a wedding reception, wearing a sparkly sequinned jacket and one oversized headphone cup pressed to its head, one arm raised in the air. Guests dance in the foreground, slightly blurred, under a glittering disco ball and colourful party lights.

### Grandmaster — `images/grandmaster.jpeg`
*Chess coaching from every grandmaster, ever. Lets you win sometimes.*
> The humanoid robot sitting at a wooden chess table in a quiet park, opposite an elderly man in a flat cap who is deep in thought. The robot rests its chin on one metal hand, as if politely pretending to think. Autumn leaves, soft golden afternoon light.

### Head Gardener — `images/head-gardener.jpeg`
*Prize-winning borders, perfect lawn stripes, talks to your tomatoes.*
> The humanoid robot wearing a wide-brimmed straw hat and a canvas apron, kneeling in a lush English cottage garden, gently tending tomato plants with metal fingers. A perfectly striped lawn and overflowing flower borders behind, a wheelbarrow nearby. Warm late-afternoon sunshine.

### Companion — `images/companion.jpeg`
*Company for the people you love when you can't be there.* (This is the sincere one; it makes the point of the project.)
> The humanoid robot sitting in an armchair beside an elderly woman in a warm, cluttered living room, the two of them looking at a photo album together. She is laughing; the robot leans in attentively. Soft lamp light, knitted blankets, framed family photos on the walls. Tender, quiet and slightly bittersweet in mood.

### Barista — `images/barista.jpeg`
*World-championship latte art. Remembers everyone's order.*
> The humanoid robot wearing a brown leather barista apron, pouring steamed milk into a cup to make intricate latte art behind the counter of a trendy independent coffee shop. An espresso machine, exposed brick and hanging plants behind it. Warm morning light, steam rising.

---

## Optional: refresh existing images

Your readme mentions redoing some of the originals. If you do, keep the filenames the same so nothing else needs changing. Also:
- **`dog.png` is 873KB.** Re-export it as a JPEG (or regenerate it) as `dog.jpeg`, and I'll update the data.
- **Logos.** Several originals show a T logo on the chest; for consistency, regenerate them without it.
