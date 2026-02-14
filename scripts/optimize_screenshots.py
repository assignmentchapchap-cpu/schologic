import os
import glob
import base64
from io import BytesIO
from PIL import Image

# Configuration
SOURCE_DIR = r"C:\Users\Manyeki\Documents\schologic\apps\portal\public\images\updated screenshots"
TARGET_WIDTH = 1366
TARGET_HEIGHT = 768
TARGET_FILE_SIZE_KB = 100
# Safety margin for base64 overhead (roughly 1.33x increase) + SVG wrapper
TARGET_JPEG_BYTES = (TARGET_FILE_SIZE_KB * 1024) * 0.70

def optimize_image(image_path):
    filename = os.path.basename(image_path)
    name_without_ext = os.path.splitext(filename)[0]
    svg_path = os.path.join(SOURCE_DIR, f"{name_without_ext}.svg")

    try:
        with Image.open(image_path) as img:
            # Convert to RGB (in case of RGBA pngs) for JPEG saving
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')

            # Resize to fit within 1366x768 while maintaining aspect ratio
            img.thumbnail((TARGET_WIDTH, TARGET_HEIGHT), Image.Resampling.LANCZOS)
            final_width, final_height = img.size
            print(f"[{filename}] Resized to {final_width}x{final_height}")

            # Compress loop
            quality = 85
            jpeg_bytes = None
            
            # Binary search-like approach or just simple decrement to find max quality under limit
            # Simple decrement is safer to ensure we don't overshoot then undershoot weirdly
            while quality > 5:
                buffer = BytesIO()
                img.save(buffer, format="JPEG", quality=quality, optimize=True)
                size = buffer.tell()
                
                if size <= TARGET_JPEG_BYTES:
                    jpeg_bytes = buffer.getvalue()
                    print(f"[{filename}] Target size met at quality {quality}: {size/1024:.2f} KB (JPEG)")
                    break
                
                # Reduction step
                if size > TARGET_JPEG_BYTES * 2:
                    quality -= 15
                elif size > TARGET_JPEG_BYTES * 1.3:
                    quality -= 10
                else:
                    quality -= 5
            
            if jpeg_bytes is None:
                 jpeg_bytes = buffer.getvalue()
                 print(f"[{filename}] WARNING: Could not meet target size. Final JPEG size: {len(jpeg_bytes)/1024:.2f} KB at quality {quality}")

            # Create SVG content
            encoded_img = base64.b64encode(jpeg_bytes).decode('utf-8')
            img_uri = f"data:image/jpeg;base64,{encoded_img}"

            svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{final_width}" height="{final_height}" viewBox="0 0 {final_width} {final_height}" version="1.1">
  <image width="{final_width}" height="{final_height}" xlink:href="{img_uri}" />
</svg>"""

            # Save SVG
            with open(svg_path, "w", encoding="utf-8") as f:
                f.write(svg_content)
            
            final_svg_size = os.path.getsize(svg_path) / 1024
            print(f"[{filename}] Saved SVG: {final_svg_size:.2f} KB")

    except Exception as e:
        print(f"[{filename}] ERROR: {e}")

def main():
    if not os.path.exists(SOURCE_DIR):
        print(f"Error: Directory not found: {SOURCE_DIR}")
        return

    png_files = glob.glob(os.path.join(SOURCE_DIR, "*.png"))
    if not png_files:
        print("No .png files found.")
        return

    print(f"Found {len(png_files)} PNG files. Processing...")
    for png_file in png_files:
        optimize_image(png_file)
    print("Done.")

if __name__ == "__main__":
    main()
