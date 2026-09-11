#!/usr/bin/env python3
"""Genera assets/CV_Simone_Ronzoni.pdf a partire da cv-print.html.

Uso:
    pip install weasyprint
    python build_pdf.py
"""

from pathlib import Path

from weasyprint import HTML

RADICE = Path(__file__).parent
SORGENTE = RADICE / "cv-print.html"
USCITA = RADICE / "assets" / "CV_Simone_Ronzoni.pdf"


def main() -> None:
    USCITA.parent.mkdir(parents=True, exist_ok=True)

    documento = HTML(filename=str(SORGENTE)).render()
    pagine = len(documento.pages)
    documento.write_pdf(str(USCITA))

    print(f"Generato {USCITA.relative_to(RADICE)} — {pagine} pagina/e")

    if pagine > 1:
        print(
            "Attenzione: il CV occupa piu' di una pagina. "
            "Accorcia i bullet o riduci font-size in cv-print.html."
        )


if __name__ == "__main__":
    main()
