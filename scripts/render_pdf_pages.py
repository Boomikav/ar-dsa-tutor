import os
import pymupdf

os.makedirs('submission/review_release/rendered_pages', exist_ok=True)
doc = pymupdf.open('submission/review_release/AR_DSA_Tutor_IEEE_Research_Paper.pdf')

print(f"Rendering {len(doc)} pages...")
for i, page in enumerate(doc):
    pix = page.get_pixmap(dpi=150)
    out_path = f'submission/review_release/rendered_pages/page_{i+1}.png'
    pix.save(out_path)
    print(f"Rendered Page {i+1} to {out_path} ({pix.width}x{pix.height})")
