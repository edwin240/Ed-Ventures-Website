from pathlib import Path
import json
import re

CATEGORY_FOLDERS = [
    Path("images/Furniture"),
    Path("images/Photography"),
    Path("images/Other Work"),
]

PRODUCT_FOLDERS = sorted(
    product_folder
    for category_folder in CATEGORY_FOLDERS
    if category_folder.exists()
    for product_folder in category_folder.iterdir()
    if product_folder.is_dir()
)

for folder in PRODUCT_FOLDERS:
    image_files = [
        file for file in folder.iterdir()
        if file.is_file()
        and file.suffix.lower() in {".avif", ".webp", ".jpg", ".jpeg", ".png"}
    ]

    def is_thumbnail(file):
        return re.search(r"_Thumbs?-", file.stem) is not None

    def image_number(file):
        match = re.search(r"-(\d+)", file.stem)
        return int(match.group(1)) if match else 0

    full_files = [file for file in image_files if not is_thumbnail(file)]
    full_prefixes = {
        re.sub(r"-\d+$", "", file.stem)
        for file in full_files
    }
    thumbnail_files = [
        file for file in image_files
        if is_thumbnail(file)
        and re.sub(r"_Thumbs?-\d+$", "", file.stem) in full_prefixes
    ]

    full_images = [
        file.name for file in sorted(
            full_files,
            key=image_number,
        )
    ]
    thumbnails = [
        file.name for file in sorted(
            thumbnail_files,
            key=image_number,
        )
    ]

    manifest = {"full": full_images, "thumbs": thumbnails}
    manifest_path = folder / "images.json"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"Generated {manifest_path} ({len(full_images)} full, {len(thumbnails)} thumbnails)")
