# Simone Ronzoni — CV

Il mio curriculum: una pagina web e un PDF A4 generato da HTML, in italiano e in inglese.

- **Online:** https://ronzosimone.github.io/curriculum-vitae/ (inglese: https://ronzosimone.github.io/curriculum-vitae/en/)
- **PDF:** [assets/CV_Simone_Ronzoni.pdf](assets/CV_Simone_Ronzoni.pdf) · [assets/CV_Simone_Ronzoni_EN.pdf](assets/CV_Simone_Ronzoni_EN.pdf)

## File

| File | Cosa fa |
| --- | --- |
| `index.html` + `style.css` | versione web, nessuna dipendenza né build |
| `en/index.html` | versione web inglese: stessa struttura e stesso CSS, si raggiunge col pulsante EN/IT nell'header |
| `cv-print.html`, `cv-print-en.html` | sorgenti della versione stampabile (A4), italiano e inglese |
| `build_pdf.py` | converte il sorgente in PDF con WeasyPrint; lingua con `--lang`, telefono con `--phone` |

Le due pagine web e i due sorgenti stampabili vanno tenuti allineati: una modifica al
contenuto va riportata anche nell'altra lingua.

## Rigenerare il PDF

```bash
pip install weasyprint
python build_pdf.py                                # PDF pubblico in assets/, senza telefono
python build_pdf.py --lang en                      # PDF pubblico inglese in assets/
python build_pdf.py --phone 3331234567             # PDF personale, con il telefono
python build_pdf.py --lang en --phone 3331234567   # PDF personale inglese (telefono con +39)
```

Il numero di telefono non è salvato nel repository: si passa solo a riga di comando.
Il PDF con il telefono viene scritto in `CV_Simone_Ronzoni_privato.pdf` (o `CV_Simone_Ronzoni_EN_privato.pdf`), escluso da git
tramite `.gitignore`, così non finisce online per sbaglio. Con `--output` si sceglie
un altro percorso.

Lo script avvisa se il CV supera una pagina.

## Statistiche

Il sito usa [Umami Cloud](https://umami.is) (piano gratuito, senza cookie): conta le visite
e i click su PDF, email, GitHub e LinkedIn. Per sapere quale azienda apre il CV, manda un
link con `?utm_source=`, per esempio
`https://ronzosimone.github.io/curriculum-vitae/?utm_source=nomeazienda`.

## Contatti

[LinkedIn](https://www.linkedin.com/in/simone-ronzoni-3bb3a3156) ·
[GitHub](https://github.com/Ronzosimone) ·
[simone.ronzo@gmail.com](mailto:simone.ronzo@gmail.com)
