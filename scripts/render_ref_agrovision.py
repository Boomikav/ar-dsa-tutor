import os
import shutil
import win32com.client
import pymupdf

agro_docx = os.path.abspath('AgroVision_Mine_IEEE_Conference_Paper_Revised.docx')
agro_pdf = os.path.abspath('submission/review_release/rendered_pages/ref_agrovision/agrovision.pdf')
out_dir = os.path.abspath('submission/review_release/rendered_pages/ref_agrovision')
os.makedirs(out_dir, exist_ok=True)

word = win32com.client.Dispatch('Word.Application')
word.Visible = False
word.DisplayAlerts = 0
try:
    doc_com = word.Documents.Open(agro_docx)
    doc_com.SaveAs2(agro_pdf, 17) # 17 is wdFormatPDF
    doc_com.Close(False)
    print("Converted AgroVision docx to PDF.")
finally:
    word.Quit()

doc = pymupdf.open(agro_pdf)
print(f"Rendering AgroVision PDF ({len(doc)} pages)...")
for i, page in enumerate(doc):
    pix = page.get_pixmap(dpi=150)
    out_path = os.path.join(out_dir, f'page_{i+1}.png')
    pix.save(out_path)
print("Rendered all AgroVision pages.")
