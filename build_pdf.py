#!/usr/bin/env python3
"""Genera il CV in PDF a partire da cv-print.html (italiano) o cv-print-en.html (inglese).

Il numero di telefono non sta nel repository: si passa a riga di comando.

Uso:
    pip install weasyprint
    python build_pdf.py                                # PDF pubblico italiano, senza telefono
    python build_pdf.py --lang en                      # PDF pubblico inglese, senza telefono
    python build_pdf.py --phone 3331234567             # PDF personale, con telefono
    python build_pdf.py --lang en --phone 3331234567   # idem in inglese, telefono con +39

I PDF pubblici finiscono in assets/ (li serve il sito); quelli con il telefono
in CV_Simone_Ronzoni_privato.pdf e CV_Simone_Ronzoni_EN_privato.pdf, esclusi
da git tramite .gitignore.
"""

from __future__ import annotations

import argparse
import html
import re
from pathlib import Path

RADICE = Path(__file__).parent
SORGENTI = {
    "it": RADICE / "cv-print.html",
    "en": RADICE / "cv-print-en.html",
}
USCITE_PUBBLICHE = {
    "it": RADICE / "assets" / "CV_Simone_Ronzoni.pdf",
    "en": RADICE / "assets" / "CV_Simone_Ronzoni_EN.pdf",
}
USCITE_PRIVATE = {
    "it": RADICE / "CV_Simone_Ronzoni_privato.pdf",
    "en": RADICE / "CV_Simone_Ronzoni_EN_privato.pdf",
}
SEGNAPOSTO = "<!-- TELEFONO -->"


def formatta_telefono(numero: str, internazionale: bool = False) -> str:
    """3331234567 -> 333 123 4567 (o +39 333 123 4567); gli altri formati restano come sono."""
    cifre = re.sub(r"\D", "", numero)
    if len(cifre) == 10 and not numero.strip().startswith("+"):
        prefisso = "+39 " if internazionale else ""
        return f"{prefisso}{cifre[:3]} {cifre[3:6]} {cifre[6:]}"
    return numero.strip()


def prepara_html(telefono: str | None, lingua: str = "it") -> str:
    """Restituisce il sorgente della lingua con il telefono al posto del segnaposto (o senza)."""
    percorso = SORGENTI[lingua]
    sorgente = percorso.read_text(encoding="utf-8")
    if SEGNAPOSTO not in sorgente:
        raise SystemExit(f"Segnaposto {SEGNAPOSTO} non trovato in {percorso.name}")

    riga = ""
    if telefono:
        # Chi legge il CV inglese chiama dall'estero: serve il prefisso internazionale
        numero = formatta_telefono(telefono, internazionale=lingua == "en")
        riga = f'<span class="sep">|</span> {html.escape(numero)}'
    return sorgente.replace(SEGNAPOSTO, riga)


def main() -> None:
    parser = argparse.ArgumentParser(description="Genera il CV in PDF da cv-print.html o cv-print-en.html.")
    parser.add_argument(
        "--lang", "-l",
        choices=sorted(SORGENTI),
        default="it",
        help="lingua del CV (default: it)",
    )
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

    uscite = USCITE_PRIVATE if args.phone else USCITE_PUBBLICHE
    uscita = args.output or uscite[args.lang]
    uscita.parent.mkdir(parents=True, exist_ok=True)

    documento = HTML(string=prepara_html(args.phone, args.lang), base_url=str(RADICE)).render()
    pagine = len(documento.pages)
    documento.write_pdf(str(uscita))

    nota = " (con telefono)" if args.phone else ""
    print(f"Generato {uscita} — {pagine} pagina/e{nota}")

    if pagine > 1:
        print(
            "Attenzione: il CV occupa piu' di una pagina. "
            f"Accorcia i bullet o riduci font-size in {SORGENTI[args.lang].name}."
        )


if __name__ == "__main__":
    main()
