from pathlib import Path
import json
import re

try:
    from PIL import Image
except ImportError as error:
    raise SystemExit(
        "Thumbnail generation requires Pillow. Install it with: python -m pip install Pillow"
    ) from error

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
        return re.search(r"_Thumbs?-\d+$", file.stem) is not None

    def image_number(file):
        match = re.search(r"-(\d+)", file.stem)
        return int(match.group(1)) if match else 0

    def full_image_key(file):
        match = re.match(r"^(.*)-(\d+)$", file.stem)
        return (match.group(1), int(match.group(2))) if match else (file.stem, 0)

    def thumbnail_path(file):
        prefix, number = full_image_key(file)
        return file.with_name(f"{prefix}_Thumb-{number}.avif")

    full_files = [file for file in image_files if not is_thumbnail(file)]
    full_image_keys = {full_image_key(file) for file in full_files}

    # Create compact previews only when the matching thumbnail is missing.
    existing_thumbnail_keys = {
        (re.sub(r"_Thumbs?-\d+$", "", file.stem), image_number(file))
        for file in image_files
        if is_thumbnail(file)
    }
    for file in full_files:
        image_key = full_image_key(file)
        if image_key in existing_thumbnail_keys:
            continue
        output_path = thumbnail_path(file)
        with Image.open(file) as image:
            image.thumbnail((640, 640), Image.Resampling.LANCZOS)
            image.convert("RGB").save(output_path, "AVIF", quality=78, speed=6)
        image_files.append(output_path)
        existing_thumbnail_keys.add(image_key)
        print(f"Generated thumbnail {output_path}")

    thumbnail_files = [
        file for file in image_files
        if is_thumbnail(file)
        and (re.sub(r"_Thumbs?-\d+$", "", file.stem), image_number(file)) in full_image_keys
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
