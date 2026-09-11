#!/usr/bin/env python3
"""Genera il CV in PDF a partire da cv-print.html.

Il numero di telefono non sta nel repository: si passa a riga di comando.

Uso:
    pip install weasyprint
    python build_pdf.py                      # PDF pubblico, senza telefono
    python build_pdf.py --phone 3331234567   # PDF personale, con telefono

Il PDF pubblico finisce in assets/ (lo serve il sito); quello con il telefono
in CV_Simone_Ronzoni_privato.pdf, escluso da git tramite .gitignore.
"""

from __future__ import annotations

import argparse
import html
import re
from pathlib import Path

RADICE = Path(__file__).parent
SORGENTE = RADICE / "cv-print.html"
USCITA_PUBBLICA = RADICE / "assets" / "CV_Simone_Ronzoni.pdf"
USCITA_PRIVATA = RADICE / "CV_Simone_Ronzoni_privato.pdf"
SEGNAPOSTO = "<!-- TELEFONO -->"


def formatta_telefono(numero: str) -> str:
    """3331234567 -> 333 123 4567; gli altri formati restano come sono."""
    cifre = re.sub(r"\D", "", numero)
    if len(cifre) == 10 and not numero.strip().startswith("+"):
        return f"{cifre[:3]} {cifre[3:6]} {cifre[6:]}"
    return numero.strip()


def prepara_html(telefono: str | None) -> str:
    """Restituisce cv-print.html con il telefono al posto del segnaposto (o senza)."""
    sorgente = SORGENTE.read_text(encoding="utf-8")
    if SEGNAPOSTO not in sorgente:
        raise SystemExit(f"Segnaposto {SEGNAPOSTO} non trovato in {SORGENTE.name}")

    riga = ""
    if telefono:
        riga = f'<span class="sep">|</span> {html.escape(formatta_telefono(telefono))}'
    return sorgente.replace(SEGNAPOSTO, riga)


def main() -> None:
    parser = argparse.ArgumentParser(description="Genera il CV in PDF da cv-print.html.")
    parser.add_argument(
        "--phone", "-phone",
        metavar="NUMERO",
        help="numero di telefono da inserire nel PDF (non viene salvato nel repository)",
    )
    parser.add_argument(
        "--output", "-o",
        type=Path,
        help="percorso del PDF (default: assets/ senza telefono, file privato con telefono)",
    )
    args = parser.parse_args()

    # Import qui: --help e prepara_html funzionano anche senza WeasyPrint installato.
    from weasyprint import HTML

    uscita = args.output or (USCITA_PRIVATA if args.phone else USCITA_PUBBLICA)
    uscita.parent.mkdir(parents=True, exist_ok=True)

    documento = HTML(string=prepara_html(args.phone), base_url=str(RADICE)).render()
    pagine = len(documento.pages)
    documento.write_pdf(str(uscita))

    nota = " (con telefono)" if args.phone else ""
    print(f"Generato {uscita} — {pagine} pagina/e{nota}")

    if pagine > 1:
        print(
            "Attenzione: il CV occupa piu' di una pagina. "
            "Accorcia i bullet o riduci font-size in cv-print.html."
        )


if __name__ == "__main__":
    main()
