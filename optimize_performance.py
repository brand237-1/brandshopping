import os
from PIL import Image

def optimize_media(directory, max_width=1200, quality=65):
    print(f"--- Optimizing: {directory} ---")
    total_saved = 0
    file_count = 0

    for root, dirs, files in os.walk(directory):
        if 'node_modules' in root or '.git' in root:
            continue

        for file in files:
            ext = file.lower()
            if ext.endswith(('.png', '.jpg', '.jpeg')):
                file_path = os.path.join(root, file)
                try:
                    original_size = os.path.getsize(file_path)
                    
                    with Image.open(file_path) as img:
                        # Special handling for LOGO
                        current_max_width = 256 if "logo" in ext or "logo" in root.lower() else max_width
                        
                        # Aggressive Resize
                        if img.width > current_max_width:
                            ratio = current_max_width / float(img.width)
                            new_height = int((float(img.height) * float(ratio)))
                            img = img.resize((current_max_width, new_height), Image.Resampling.LANCZOS)
                        
                        # Export based on format
                        if ext.endswith('.png'):
                            # Quantize to 8-bit palette (HUGE SAVINGS for PNG)
                            img = img.convert("P", palette=Image.ADAPTIVE, colors=256)
                            img.save(file_path, optimize=True)
                        else:
                            # Progressive/Optimized JPG
                            if img.mode in ("RGBA", "P"):
                                img = img.convert("RGB")
                            img.save(file_path, quality=quality, optimize=True, progressive=True)
                    
                    compressed_size = os.path.getsize(file_path)
                    saved = original_size - compressed_size
                    total_saved += saved
                    file_count += 1
                    
                    if saved > 0:
                        reduction = (saved / original_size) * 100
                        print(f"OK: {file} [{reduction:.1f}% smaller] ({original_size/1024:.0f}KB -> {compressed_size/1024:.0f}KB)")
                    else:
                        print(f"SKIP: {file} (already thin)")
                except Exception as e:
                    print(f"FAIL: {file}: {e}")

    return total_saved, file_count

if __name__ == "__main__":
    base_path = r"c:\Users\KENZY\OneDrive\Desktop\brandshoppingLTD"
    targets = [
        os.path.join(base_path, "pictures"),
        os.path.join(base_path, "frontend", "public")
    ]
    
    grand_saved = 0
    grand_count = 0
    
    for t in targets:
        if os.path.exists(t):
            s, c = optimize_media(t)
            grand_saved += s
            grand_count += c
            
    print(f"\n🚀 EXTREME OPTIMIZATION COMPLETE 🚀")
    print(f"Files Optimized: {grand_count}")
    print(f"Total Weight Shredded: {grand_saved/1024/1024:.2f} MB ✨")
