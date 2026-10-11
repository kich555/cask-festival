"""참가업체 디자인 에셋 ZIP 생성.

원본 `design assets/` → `public/exhibitor-assets/*.zip`
압축 안 파일명은 원본 한글명 그대로 (NFC + UTF-8 플래그 → Windows에서도 안 깨짐).
에셋을 바꾼 뒤 실행:  python3 scripts/build-exhibitor-assets.py
"""

import pathlib
import unicodedata
import zipfile

SRC = pathlib.Path("design assets")
OUT = pathlib.Path("public/exhibitor-assets")


def nfc(s: str) -> str:
    return unicodedata.normalize("NFC", s)


LOGO_AI = "cc_2026 logo.ai"

GROUPS = {
    # 로고 PNG + 로고 AI
    "cask-carnival-2026-logos.zip": (
        "캐스크 카니발 2026 로고",
        lambda p: "로고" in nfc(p.name) or p.name == LOGO_AI,
    ),
    # 포스터·포맷 PNG + 디자인 에셋 모음 AI
    "cask-carnival-2026-posters.zip": (
        "캐스크 카니발 2026 포스터·포맷",
        lambda p: "로고" not in nfc(p.name) and p.name != LOGO_AI and p.suffix in (".png", ".ai"),
    ),
    "cask-carnival-2026-design-assets.zip": (
        "캐스크 카니발 2026 디자인 에셋",
        lambda p: p.suffix in (".png", ".ai"),
    ),
}

for zip_name, (folder, pick) in GROUPS.items():
    files = sorted(p for p in SRC.iterdir() if pick(p) and not p.name.startswith("~"))
    out = OUT / zip_name
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        for p in files:
            z.write(p, nfc(f"{folder}/{p.name}"))
        if zip_name == "cask-carnival-2026-design-assets.zip":
            # 브랜드 가이드 (scripts/brand-guide/build.sh 로 생성)
            z.write(OUT / "cask-carnival-2026-brand-guide.pdf", nfc(f"{folder}/브랜드 가이드.pdf"))
    print(f"{zip_name}: {len(files)} files, {out.stat().st_size / 1e6:.1f}MB")
