#!/usr/bin/env python3
"""
Crops the bottom off the Canva-created combined image.
Usage: python3 crop_canva.py
"""

try:
    from PIL import Image
except ImportError:
    print("PIL/Pillow not installed. Installing now...")
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image

# Load the Canva image
img = Image.open('Combined-images-Canva.png')

print(f"Original image dimensions: {img.size}")
print(f"Height: {img.height}px")

# How much to crop from bottom (in pixels)
crop_bottom = 100  # Adjust this value as needed

# Crop from bottom
img_cropped = img.crop((0, 0, img.width, img.height - crop_bottom))

# Save as the combined printout
img_cropped.save('printout-sample-combined.png', 'PNG', quality=95)

print(f"✓ Cropped {crop_bottom}px from bottom")
print(f"✓ New dimensions: {img_cropped.size}")
print(f"✓ Saved as printout-sample-combined.png")
