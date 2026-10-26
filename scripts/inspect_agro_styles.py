import docx
from docx.shared import Inches, Pt, RGBColor

doc = docx.Document('AgroVision_Mine_IEEE_Conference_Paper_Revised.docx')

print("Styles in AgroVision:")
for s in doc.styles:
    if any(k in s.name.lower() for k in ['title', 'author', 'head', 'body', 'table', 'fig', 'ref', 'eq']):
        print(f"  {s.name} ({s.type})")

print("\nSample Paragraphs from AgroVision:")
for i, p in enumerate(doc.paragraphs[:25]):
    if p.text.strip():
        runs_info = [(r.text[:20], r.font.name, r.font.size.pt if r.font.size else None, r.bold, r.italic) for r in p.runs[:2]]
        print(f"P{i} [{p.style.name}]: text='{p.text[:60]}' | runs={runs_info}")

print("\nTables in AgroVision:")
for i, t in enumerate(doc.tables[:2]):
    print(f"Table {i}: rows={len(t.rows)}, cols={len(t.columns)}")
    hdr = [c.text.strip().replace('\n', ' ') for c in t.rows[0].cells]
    print(f"  Header: {hdr[:4]}")
