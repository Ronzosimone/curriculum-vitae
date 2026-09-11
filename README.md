# Simone Ronzoni — CV

Il mio curriculum: una pagina web e un PDF A4 generato da HTML.

- **Online:** https://ronzosimone.github.io/curriculum-vitae/
- **PDF:** [assets/CV_Simone_Ronzoni.pdf](assets/CV_Simone_Ronzoni.pdf)

## File

| File | Cosa fa |
| --- | --- |
| `index.html` + `style.css` | versione web, nessuna dipendenza né build |
| `cv-print.html` | sorgente della versione stampabile (A4) |
| `build_pdf.py` | converte `cv-print.html` in PDF con WeasyPrint |

## Rigenerare il PDF

```bash
pip install weasyprint
python build_pdf.py
```

Lo script avvisa se il CV supera una pagina.

## Contatti

[LinkedIn](https://www.linkedin.com/in/simone-ronzoni-3bb3a3156) ·
[GitHub](https://github.com/Ronzosimone) ·
[simone.ronzo@gmail.com](mailto:simone.ronzo@gmail.com)
