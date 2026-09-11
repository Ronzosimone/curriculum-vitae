# Simone Ronzoni — CV

Il mio curriculum, in due formati che restano allineati: una pagina web e un PDF
generato dallo stesso sorgente HTML.

**Online:** https://ronzosimone.github.io/cv/
**PDF:** [assets/CV_Simone_Ronzoni.pdf](assets/CV_Simone_Ronzoni.pdf)

## Come è fatto

| File | Cosa fa |
| --- | --- |
| `index.html` + `style.css` | la versione web, senza dipendenze e senza build |
| `cv-print.html` | il sorgente della versione stampabile, impaginato in A4 |
| `build_pdf.py` | converte `cv-print.html` in PDF con WeasyPrint |
| `.github/workflows/build-cv.yml` | rigenera e committa il PDF a ogni modifica del sorgente |

Il PDF non viene modificato a mano: si edita `cv-print.html` e ci pensa la pipeline.
Così la versione che mando via mail e quella online non divergono mai.

## Rigenerare il PDF in locale

```bash
pip install weasyprint
python build_pdf.py
```

Su Debian/Ubuntu servono anche le librerie di sistema di Pango:

```bash
sudo apt-get install libpango-1.0-0 libpangoft2-1.0-0 fonts-crosextra-carlito
```

Lo script segnala se il CV sfora la singola pagina.

## Pubblicare su GitHub Pages

Settings → Pages → Source: `Deploy from a branch` → branch `main`, cartella `/ (root)`.

## Contatti

[LinkedIn](https://www.linkedin.com/in/simone-ronzoni-3bb3a3156) ·
[simone.ronzo@gmail.com](mailto:simone.ronzo@gmail.com)
