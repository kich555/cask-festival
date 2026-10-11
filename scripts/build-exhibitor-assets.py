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


GROUPS = {
    "cask-carnival-2026-logos.zip": ("캐스크 카니발 2026 로고", lambda p: "로고" in nfc(p.name)),
    "cask-carnival-2026-posters.zip": (
        "캐스크 카니발 2026 포스터·포맷",
        lambda p: p.suffix == ".png" and "로고" not in nfc(p.name),
    ),
    "cask-carnival-2026-ai.zip": ("캐스크 카니발 2026 AI 원본", lambda p: p.suffix == ".ai"),
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
    print(f"{zip_name}: {len(files)} files, {out.stat().st_size / 1e6:.1f}MB")
