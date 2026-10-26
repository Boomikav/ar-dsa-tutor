import os
import pymupdf

os.makedirs('submission/review_release/rendered_pages/ref_paper14', exist_ok=True)
doc = pymupdf.open('paper (14).pdf')
print(f"Rendering paper (14).pdf ({len(doc)} pages)...")
for i, page in enumerate(doc):
    pix = page.get_pixmap(dpi=150)
    out_path = f'submission/review_release/rendered_pages/ref_paper14/page_{i+1}.png'
    pix.save(out_path)
print("Rendered all reference paper (14).pdf pages.")
