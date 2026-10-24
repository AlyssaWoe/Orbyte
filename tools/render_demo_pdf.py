"""
Renders a Markdown file to PDF through headless Chrome.

Used for the demo script deliverable. Chrome is driven with a throwaway
user-data-dir and a temp output path because printing straight into a
user-owned folder can fail with Access Denied on Windows.
"""

import html
import os
import re
import shutil
import subprocess
import sys
import tempfile

CHROME_CANDIDATES = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
]

CSS = """
@page { size: A4; margin: 16mm 14mm; }
body { font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;
       font-size: 10.5pt; line-height: 1.5; color: #111827; }
h1 { font-size: 22pt; margin: 0 0 10pt; color: #14532d; border-bottom: 3px solid #16a34a; padding-bottom: 6pt; }
h2 { font-size: 14pt; margin: 16pt 0 6pt; color: #14532d; page-break-after: avoid; }
h3 { font-size: 11.5pt; margin: 12pt 0 4pt; color: #1f2937; page-break-after: avoid; }
p { margin: 0 0 6pt; }
ul, ol { margin: 0 0 8pt 16pt; padding: 0; }
li { margin-bottom: 3pt; }
blockquote { margin: 6pt 0; padding: 6pt 10pt; border-left: 3px solid #16a34a; background: #f0fdf4; color: #14532d; }
blockquote p { margin: 0 0 4pt; }
hr { border: none; border-top: 1px solid #d1d5db; margin: 14pt 0; }
table { border-collapse: collapse; width: 100%; margin: 6pt 0 10pt; font-size: 9.5pt; page-break-inside: avoid; }
th, td { border: 1px solid #d1d5db; padding: 4pt 6pt; text-align: left; vertical-align: top; }
th { background: #f3f4f6; font-weight: 700; }
code { font-family: Consolas, "Courier New", monospace; font-size: 9.5pt; background: #f3f4f6; padding: 0 3pt; border-radius: 3px; }
strong { color: #111827; }
.small { color: #6b7280; font-size: 9pt; }
"""


def inline(text):
    text = html.escape(text, quote=False)
    text = re.sub(r"`([^`]+)`", r"<code>\1</code>", text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<em>\1</em>", text)
    return text


def convert(markdown_text):
    lines = markdown_text.replace("\r\n", "\n").split("\n")
    out = []
    i = 0
    list_open = None

    def close_list():
        nonlocal list_open
        if list_open:
            out.append(f"</{list_open}>")
            list_open = None

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        if not stripped:
            close_list()
            i += 1
            continue

        if stripped.startswith("|"):
            close_list()
            rows = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                rows.append(lines[i].strip())
                i += 1
            parsed = [[c.strip() for c in r.strip("|").split("|")] for r in rows]
            header = parsed[0]
            body = [r for r in parsed[1:] if not all(re.fullmatch(r":?-{2,}:?", c or "-") for c in r)]
            out.append("<table><thead><tr>" + "".join(f"<th>{inline(c)}</th>" for c in header) + "</tr></thead><tbody>")
            for row in body:
                out.append("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in row) + "</tr>")
            out.append("</tbody></table>")
            continue

        if stripped.startswith("#"):
            close_list()
            level = len(stripped) - len(stripped.lstrip("#"))
            text = stripped[level:].strip()
            out.append(f"<h{level}>{inline(text)}</h{level}>")
            i += 1
            continue

        if stripped in ("---", "***", "___"):
            close_list()
            out.append("<hr/>")
            i += 1
            continue

        if stripped.startswith(">"):
            close_list()
            block = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                block.append(lines[i].strip().lstrip(">").strip())
                i += 1
            out.append("<blockquote>" + "".join(f"<p>{inline(b)}</p>" for b in block if b) + "</blockquote>")
            continue

        bullet = re.match(r"^[-*]\s+(.*)$", stripped)
        ordered = re.match(r"^\d+\.\s+(.*)$", stripped)
        if bullet or ordered:
            wanted = "ul" if bullet else "ol"
            if list_open != wanted:
                close_list()
                out.append(f"<{wanted}>")
                list_open = wanted
            out.append(f"<li>{inline((bullet or ordered).group(1))}</li>")
            i += 1
            continue

        close_list()
        paragraph = [stripped]
        i += 1
        while i < len(lines) and lines[i].strip() and not re.match(r"^(#|\||>|[-*]\s|\d+\.\s|---)", lines[i].strip()):
            paragraph.append(lines[i].strip())
            i += 1
        out.append("<p>" + inline(" ".join(paragraph)) + "</p>")

    close_list()
    return f"<!doctype html><html><head><meta charset='utf-8'><style>{CSS}</style></head><body>{''.join(out)}</body></html>"


def find_chrome():
    for path in CHROME_CANDIDATES:
        if os.path.exists(path):
            return path
    raise SystemExit("Chrome not found")


def main():
    if len(sys.argv) != 3:
        raise SystemExit("usage: render_demo_pdf.py <input.md> <output.pdf>")
    source, target = sys.argv[1], sys.argv[2]

    with open(source, "r", encoding="utf-8") as fh:
        page = convert(fh.read())

    workdir = tempfile.mkdtemp(prefix="orbyte_pdf_")
    try:
        html_path = os.path.join(workdir, "script.html")
        temp_pdf = os.path.join(workdir, "script.pdf")
        with open(html_path, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(page)

        profile = os.path.join(workdir, "profile")
        result = subprocess.run(
            [
                find_chrome(),
                "--headless=new",
                "--disable-gpu",
                "--no-sandbox",
                "--no-first-run",
                "--no-pdf-header-footer",
                f"--user-data-dir={profile}",
                f"--print-to-pdf={temp_pdf}",
                "file:///" + html_path.replace("\\", "/"),
            ],
            capture_output=True,
            text=True,
            timeout=90,
        )
        if result.returncode != 0 or not os.path.exists(temp_pdf):
            raise SystemExit(f"Chrome failed: {result.returncode}\n{result.stderr[-800:]}")

        os.makedirs(os.path.dirname(os.path.abspath(target)), exist_ok=True)
        shutil.copyfile(temp_pdf, target)
        print(f"wrote {target} ({os.path.getsize(target)} bytes)")
    finally:
        shutil.rmtree(workdir, ignore_errors=True)


if __name__ == "__main__":
    main()
