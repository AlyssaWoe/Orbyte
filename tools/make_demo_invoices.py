"""
Generates the demo invoice PDFs used for the Orbyte upload walkthrough.

No third-party PDF library is required: each file is written as a minimal
single-page PDF with a Helvetica text layer, which is exactly what Agent 1's
pypdf path reads on the deployed site. The numbers are chosen so the extracted
line items balance against the printed total, otherwise Agent 1 correctly
routes the invoice to NEEDS_DATA_REVIEW.
"""

import os

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "demo")

INVOICES = [
    {
        "filename": "Orbyte-Demo-Invoice-INV-2026-8801.pdf",
        "lines": [
            "COMMERCIAL INVOICE",
            "Invoice ID: INV-2026-8801",
            "Issue Date: 2026-09-12",
            "Due Date: 2026-10-10",
            "",
            "Bill To: Nusantara Retail Group",
            "Email: accounts@nusantara-retail.com",
            "",
            "Description                        Qty     Unit Price      Amount",
            "------------------------------------------------------------",
            "Warehouse Pallet Racking             2        1450.00      2900.00",
            "Forklift Preventive Servicing        1        1150.00      1150.00",
            "",
            "Total Amount: $4,050.00 USD",
            "Payment Terms: Net 28 days",
        ],
    },
    {
        "filename": "Orbyte-Demo-Invoice-INV-2026-8802.pdf",
        "lines": [
            "COMMERCIAL INVOICE",
            "Invoice ID: INV-2026-8802",
            "Issue Date: 2026-09-20",
            "Due Date: 2026-10-18",
            "",
            "Bill To: Straits Marine Supply",
            "Email: ap@straitsmarine.example",
            "",
            "Description                        Qty     Unit Price      Amount",
            "------------------------------------------------------------",
            "Cold Chain Packaging Audit           1        1350.00      1350.00",
            "Dock Safety Inspection               2         500.00      1000.00",
            "",
            "Total Amount: $2,350.00 USD",
            "Payment Terms: Net 28 days",
        ],
    },
    {
        "filename": "Orbyte-Demo-Invoice-INV-2026-8803.pdf",
        "lines": [
            "COMMERCIAL INVOICE",
            "Invoice ID: INV-2026-8803",
            "Issue Date: 2026-09-25",
            "Due Date: 2026-10-23",
            "",
            "Bill To: Highland Cold Storage",
            "Email: finance@highlandcold.example",
            "",
            "Description                        Qty     Unit Price      Amount",
            "------------------------------------------------------------",
            "Refrigeration Retrofit Audit         3        1260.00      3780.00",
            "Emergency Generator Service          1        3000.00      3000.00",
            "",
            "Total Amount: $6,780.00 USD",
            "Payment Terms: Net 28 days",
        ],
    },
]


def _escape(text: str) -> str:
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def build_pdf(lines):
    content_parts = ["BT", "/F1 11 Tf", "16 TL", "56 780 Td"]
    for line in lines:
        content_parts.append(f"({_escape(line)}) Tj")
        content_parts.append("T*")
    content_parts.append("ET")
    content = "\n".join(content_parts).encode("ascii")

    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
        b"/Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
        b"<< /Length " + str(len(content)).encode() + b" >>\nstream\n" + content + b"\nendstream",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ]

    header = b"%PDF-1.4\n"
    body = b""
    offsets = []
    for index, obj in enumerate(objects, start=1):
        offsets.append(len(header) + len(body))
        body += f"{index} 0 obj\n".encode() + obj + b"\nendobj\n"

    xref_at = len(header) + len(body)
    xref = f"xref\n0 {len(objects) + 1}\n".encode()
    xref += b"0000000000 65535 f \n"
    for offset in offsets:
        xref += f"{offset:010d} 00000 n \n".encode()

    trailer = (
        b"trailer\n<< /Size " + str(len(objects) + 1).encode() + b" /Root 1 0 R >>\n"
        b"startxref\n" + str(xref_at).encode() + b"\n%%EOF\n"
    )
    return header + body + xref + trailer


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    for inv in INVOICES:
        path = os.path.join(OUT_DIR, inv["filename"])
        with open(path, "wb") as fh:
            fh.write(build_pdf(inv["lines"]))
        print(f"wrote {path} ({os.path.getsize(path)} bytes)")

    txt_path = os.path.join(OUT_DIR, "Orbyte-Demo-Invoice-INV-2026-8801.txt")
    with open(txt_path, "w", encoding="ascii", newline="\n") as fh:
        fh.write("\n".join(INVOICES[0]["lines"]) + "\n")
    print(f"wrote {txt_path} ({os.path.getsize(txt_path)} bytes)")


if __name__ == "__main__":
    main()
