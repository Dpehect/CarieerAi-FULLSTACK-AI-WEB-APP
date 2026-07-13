"""
Pathora — Rapor export (Markdown + HTML).
Harici ücretli servis yok; tarayıcıdan indirilebilir dosya üretir.
"""

from __future__ import annotations

import html
import re
from datetime import datetime
from typing import Dict, List, Optional


def build_markdown_report(
    title: str,
    sections: Dict[str, str],
    meta: Optional[Dict[str, str]] = None,
) -> str:
    """Çok bölümlü markdown rapor."""
    lines: List[str] = [
        f"# {title}",
        "",
        f"_Oluşturulma: {datetime.now().strftime('%Y-%m-%d %H:%M')}_",
        "",
        "> Pathora — local report. Advice is informational only.",
        "",
    ]
    if meta:
        lines.append("## Summary")
        for k, v in meta.items():
            lines.append(f"- **{k}:** {v}")
        lines.append("")

    for heading, body in sections.items():
        if not (body or "").strip():
            continue
        lines.append(f"## {heading}")
        lines.append("")
        lines.append(body.strip())
        lines.append("")

    lines.append("---")
    lines.append("*Pathora · Ollama · 100% local*")
    return "\n".join(lines)


def _md_inline(text: str) -> str:
    """Çok basit markdown → HTML (başlık, kalın, kod, liste)."""
    text = html.escape(text)
    # code
    text = re.sub(r"`([^`]+)`", r"<code>\1</code>", text)
    # bold
    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    return text


def markdown_to_simple_html(md: str, page_title: str = "Pathora Report") -> str:
    """Bağımlılıksız hafif HTML (yazdır / PDF olarak kaydet için uygun)."""
    body_parts: List[str] = []
    in_list = False
    in_table = False

    for raw_line in (md or "").splitlines():
        line = raw_line.rstrip()
        stripped = line.strip()

        # Tablo
        if stripped.startswith("|") and stripped.endswith("|"):
            if re.match(r"^\|[\s\-:|]+\|$", stripped):
                continue  # separator
            cells = [c.strip() for c in stripped.strip("|").split("|")]
            if not in_table:
                body_parts.append("<table>")
                in_table = True
                body_parts.append(
                    "<tr>" + "".join(f"<th>{_md_inline(c)}</th>" for c in cells) + "</tr>"
                )
            else:
                body_parts.append(
                    "<tr>" + "".join(f"<td>{_md_inline(c)}</td>" for c in cells) + "</tr>"
                )
            continue
        elif in_table:
            body_parts.append("</table>")
            in_table = False

        if stripped.startswith("### "):
            if in_list:
                body_parts.append("</ul>")
                in_list = False
            body_parts.append(f"<h3>{_md_inline(stripped[4:])}</h3>")
        elif stripped.startswith("## "):
            if in_list:
                body_parts.append("</ul>")
                in_list = False
            body_parts.append(f"<h2>{_md_inline(stripped[3:])}</h2>")
        elif stripped.startswith("# "):
            if in_list:
                body_parts.append("</ul>")
                in_list = False
            body_parts.append(f"<h1>{_md_inline(stripped[2:])}</h1>")
        elif stripped.startswith(("- ", "* ", "• ")):
            if not in_list:
                body_parts.append("<ul>")
                in_list = True
            body_parts.append(f"<li>{_md_inline(stripped[2:].strip())}</li>")
        elif stripped.startswith(">"):
            if in_list:
                body_parts.append("</ul>")
                in_list = False
            body_parts.append(f"<blockquote>{_md_inline(stripped.lstrip('> ').strip())}</blockquote>")
        elif stripped == "---":
            if in_list:
                body_parts.append("</ul>")
                in_list = False
            body_parts.append("<hr/>")
        elif not stripped:
            if in_list:
                body_parts.append("</ul>")
                in_list = False
        else:
            if in_list:
                body_parts.append("</ul>")
                in_list = False
            body_parts.append(f"<p>{_md_inline(stripped)}</p>")

    if in_list:
        body_parts.append("</ul>")
    if in_table:
        body_parts.append("</table>")

    return f"""<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>{html.escape(page_title)}</title>
<style>
  :root {{ --ink:#0f172a; --muted:#64748b; --line:#e2e8f0; --accent:#0369a1; }}
  body {{ font-family: "Segoe UI", system-ui, sans-serif; color:var(--ink);
         max-width:820px; margin:2rem auto; padding:0 1.25rem; line-height:1.55; }}
  h1 {{ font-size:1.75rem; letter-spacing:-0.02em; }}
  h2 {{ color:var(--accent); border-bottom:1px solid var(--line); padding-bottom:.35rem; margin-top:2rem; }}
  h3 {{ margin-top:1.25rem; }}
  code {{ background:#f1f5f9; padding:.1rem .35rem; border-radius:4px; font-size:.9em; }}
  table {{ border-collapse:collapse; width:100%; margin:1rem 0; font-size:.92rem; }}
  th, td {{ border:1px solid var(--line); padding:.5rem .65rem; text-align:left; }}
  th {{ background:#f8fafc; }}
  blockquote {{ margin:1rem 0; padding:.5rem 1rem; border-left:4px solid var(--accent);
               background:#f8fafc; color:var(--muted); }}
  hr {{ border:none; border-top:1px solid var(--line); margin:2rem 0; }}
  @media print {{ body {{ margin:0; }} }}
</style>
</head>
<body>
{"".join(body_parts)}
<script>/* Yazdır: Ctrl+P → PDF olarak kaydet */</script>
</body>
</html>
"""


def export_bundle(
    report_md: str,
    title: str = "Pathora Report",
) -> Dict[str, str]:
    """Hem md hem html string döner."""
    return {
        "markdown": report_md,
        "html": markdown_to_simple_html(report_md, page_title=title),
    }
