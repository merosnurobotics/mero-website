"""Build a small site font; the original font remains the runtime glyph fallback.

Requires fonttools[woff]. Run after changing the site's static text.
"""
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1]
source = root / "public/fonts/PretendardVariable.woff2"
destination = root / "public/fonts/MeroSiteSans.woff2"
characters = set(chr(value) for value in range(32, 256))
for path in (root / "src").rglob("*"):
    if path.suffix in {".ts", ".tsx", ".css"}:
        characters.update(path.read_text(encoding="utf-8"))

font = TTFont(source)
options = subset.Options()
options.flavor = "woff2"
options.name_IDs = ["*"]
options.name_languages = ["*"]
subsetter = subset.Subsetter(options=options)
subsetter.populate(unicodes={ord(character) for character in characters})
subsetter.subset(font)

# The OFL reserves upstream family names for unmodified versions.
names = {
    1: "MERO Site Sans", 2: "Regular", 3: "MERO Site Sans 1.0",
    4: "MERO Site Sans", 6: "MeroSiteSans", 16: "MERO Site Sans",
    17: "Regular", 25: "MeroSiteSans",
}
for record in font["name"].names:
    if record.nameID in names:
        record.string = names[record.nameID].encode(record.getEncoding(), errors="replace")
font.flavor = "woff2"
font.save(destination)
print(f"Saved {destination.relative_to(root)} ({destination.stat().st_size:,} bytes)")
