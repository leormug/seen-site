#!/usr/bin/env python3
"""
Combines two overlapping printout screenshots into one seamless image.
Usage: python3 combine_images.py
"""

try:
    from PIL import Image
except ImportError:
    print("PIL/Pillow not installed. Installing now...")
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image

# Load the two images
img1 = Image.open('printout-sample-1.png')
img2 = Image.open('printout-sample-2.png')

# Crop measurements
# Image 1: keep only first 1405 pixels from top
# Image 2: skip first 146 pixels from top
crop_height_img1 = 1405
skip_height_img2 = 146

# Horizontal shift amount - shift image 1 left (crop from left edge)
x_shift = 7

# Crop image 1 (keep top portion, crop 7px from left edge)
img1_cropped = img1.crop((x_shift, 0, img1.width, crop_height_img1))

# Crop image 2 (remove top portion, keep full width)
img2_cropped = img2.crop((0, skip_height_img2, img2.width, img2.height))

# Calculate combined dimensions
# Use the max width after img1 is cropped
combined_width = max(img1.width - x_shift, img2.width)
combined_height = crop_height_img1 + (img2.height - skip_height_img2)

# Create new image with combined height
combined = Image.new('RGB', (combined_width, combined_height), 'white')

# Paste the cropped images (both at x=0, left-aligned)
combined.paste(img1_cropped, (0, 0))
combined.paste(img2_cropped, (0, crop_height_img1))

# Save the result
combined.save('printout-sample-combined.png', 'PNG', quality=95)

print(f"✓ Successfully created printout-sample-combined.png")
print(f"  Image 1 dimensions: {img1.size}")
print(f"  Image 2 dimensions: {img2.size}")
print(f"  Combined dimensions: {combined.size}")
print(f"  Cropped {img1.height - crop_height_img1}px from bottom of image 1")
print(f"  Cropped {skip_height_img2}px from top of image 2")
