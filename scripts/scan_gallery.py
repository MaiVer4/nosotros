#!/usr/bin/env python3
"""
Optimiza la galería en public/media/ (WebP + miniaturas/pósters),
detecta archivos nuevos no indexados y mantiene sincronizados:
  - public/data/siteContent.json
  - src/data/defaultSiteContent.json

Uso:
  npm run scan:gallery
"""

from __future__ import annotations

import datetime
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Any

from PIL import Image, ImageFile, ImageOps

ImageFile.LOAD_TRUNCATED_IMAGES = True

BASE_DIR = Path(__file__).resolve().parent.parent
PUBLIC_DIR = BASE_DIR / "public"
MEDIA_DIR = PUBLIC_DIR / "media"
THUMBS_DIR = MEDIA_DIR / "thumbs"
SITE_CONTENT_PATH = PUBLIC_DIR / "data" / "siteContent.json"
DEFAULT_CONTENT_PATH = BASE_DIR / "src" / "data" / "defaultSiteContent.json"

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}
RASTER_TO_WEBP_EXTS = {".jpg", ".jpeg", ".png"}
VIDEO_EXTS = {".mp4", ".webm", ".mov"}
MAX_FULL_DIM = 1600
MAX_THUMB_DIM = 520


def format_mb(num_bytes: int) -> str:
    return f"{num_bytes / (1024 * 1024):.2f} MB"


def is_in_thumbs(path: Path) -> bool:
    try:
        path.relative_to(THUMBS_DIR)
        return True
    except ValueError:
        return False


def convert_to_webp(src: Path) -> tuple[Path, bool, int, int]:
    """Convierte JPG/PNG a WebP con rotación EXIF correcta y máx. 1600px."""
    dst = src.with_suffix(".webp")
    old_size = src.stat().st_size

    with Image.open(src) as raw_im:
        im = ImageOps.exif_transpose(raw_im)
        has_alpha = im.mode in ("RGBA", "LA") or (
            im.mode == "P" and "transparency" in im.info
        )
        target_mode = "RGBA" if has_alpha else "RGB"
        if im.mode != target_mode:
            im = im.convert(target_mode)
        if max(im.size) > MAX_FULL_DIM:
            im.thumbnail((MAX_FULL_DIM, MAX_FULL_DIM), Image.Resampling.LANCZOS)
        im.save(dst, format="WEBP", quality=82, method=6)

    new_size = dst.stat().st_size
    if dst.exists() and new_size > 0 and src.resolve() != dst.resolve():
        src.unlink()
    return dst, True, old_size, new_size


def ensure_image_thumb(src: Path, thumb_dst: Path) -> bool:
    """Genera miniatura WebP de hasta 520px si no existe o está desactualizada."""
    if thumb_dst.exists() and thumb_dst.stat().st_mtime >= src.stat().st_mtime:
        return False
    thumb_dst.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(src) as raw_im:
        im = ImageOps.exif_transpose(raw_im)
        has_alpha = im.mode in ("RGBA", "LA") or (
            im.mode == "P" and "transparency" in im.info
        )
        target_mode = "RGBA" if has_alpha else "RGB"
        if im.mode != target_mode:
            im = im.convert(target_mode)
        im.thumbnail((MAX_THUMB_DIM, MAX_THUMB_DIM), Image.Resampling.LANCZOS)
        im.save(thumb_dst, format="WEBP", quality=76, method=6)
    return True


def ensure_video_poster(src: Path, poster_dst: Path) -> bool:
    """Extrae póster WebP de un video con ffmpeg."""
    if poster_dst.exists() and poster_dst.stat().st_mtime >= src.stat().st_mtime:
        return False
    poster_dst.parent.mkdir(parents=True, exist_ok=True)
    for seek in ("00:00:00.5", "00:00:00"):
        cmd = [
            "ffmpeg",
            "-y",
            "-loglevel",
            "error",
            "-ss",
            seek,
            "-i",
            str(src),
            "-vframes",
            "1",
            "-vf",
            "scale='min(640,iw)':-2",
            str(poster_dst),
        ]
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode == 0 and poster_dst.exists() and poster_dst.stat().st_size > 0:
            return True
    return False


def extract_date_from_file(path: Path) -> str:
    m = re.search(r"(\d{4}-\d{2}-\d{2})", path.name)
    if m:
        return m.group(1)
    dt = datetime.datetime.fromtimestamp(path.stat().st_mtime)
    return dt.strftime("%Y-%m-%d")


def rel_media_to_url(rel: Path) -> str:
    return f"./media/{rel.as_posix()}"


def url_to_rel_media(url: str) -> Path | None:
    if not url or not url.startswith("./media/"):
        return None
    return Path(url[len("./media/") :])


def rewrite_item_urls(item: dict[str, Any], thumb_map: dict[str, str]) -> None:
    url = item.get("url", "")
    rel = url_to_rel_media(url)
    if rel is None:
        return
    ext = rel.suffix.lower()
    if ext in RASTER_TO_WEBP_EXTS:
        webp_rel = rel.with_suffix(".webp")
        if (MEDIA_DIR / webp_rel).exists():
            rel = webp_rel
            item["url"] = rel_media_to_url(rel)
    thumb_rel = thumb_map.get(rel.as_posix())
    if thumb_rel:
        item["thumbUrl"] = rel_media_to_url(Path("thumbs") / thumb_rel)


def main() -> int:
    if not MEDIA_DIR.exists():
        print(f"No se encontró {MEDIA_DIR}", file=sys.stderr)
        return 1

    # 1. Calcular peso inicial
    before_bytes = sum(
        p.stat().st_size
        for p in MEDIA_DIR.rglob("*")
        if p.is_file() and not is_in_thumbs(p) and p.name != "README.md"
    )

    # 2. Convertir JPG/PNG a WebP
    converted_count = 0
    raster_candidates = sorted(
        p
        for p in MEDIA_DIR.rglob("*")
        if p.is_file()
        and not is_in_thumbs(p)
        and p.suffix.lower() in RASTER_TO_WEBP_EXTS
    )
    for src in raster_candidates:
        try:
            _, converted, _, _ = convert_to_webp(src)
            if converted:
                converted_count += 1
        except Exception as exc:
            print(f"[ERROR] No se pudo convertir {src}: {exc}", file=sys.stderr)
            return 1

    # 3. Generar miniaturas y pósters de video
    expected_thumbs: set[Path] = set()
    thumb_map: dict[str, str] = {}
    thumbs_generated = 0
    posters_generated = 0
    media_files: list[Path] = []

    for src in sorted(MEDIA_DIR.rglob("*")):
        if not src.is_file() or is_in_thumbs(src) or src.name == "README.md":
            continue
        ext = src.suffix.lower()
        rel = src.relative_to(MEDIA_DIR)

        if ext in IMAGE_EXTS:
            media_files.append(src)
            thumb_rel = rel.with_suffix(".webp")
            thumb_dst = THUMBS_DIR / thumb_rel
            try:
                if ensure_image_thumb(src, thumb_dst):
                    thumbs_generated += 1
                expected_thumbs.add(thumb_dst.resolve())
                thumb_map[rel.as_posix()] = thumb_rel.as_posix()
            except Exception as exc:
                print(f"[WARN] Miniatura falló para {rel}: {exc}", file=sys.stderr)
        elif ext in VIDEO_EXTS:
            media_files.append(src)
            poster_rel = rel.with_suffix(".webp")
            poster_dst = THUMBS_DIR / poster_rel
            try:
                if ensure_video_poster(src, poster_dst):
                    posters_generated += 1
                if poster_dst.exists():
                    expected_thumbs.add(poster_dst.resolve())
                    thumb_map[rel.as_posix()] = poster_rel.as_posix()
            except Exception as exc:
                print(f"[WARN] Póster falló para {rel}: {exc}", file=sys.stderr)

    # 4. Limpiar miniaturas huérfanas
    removed_orphans = 0
    if THUMBS_DIR.exists():
        for thumb in sorted(THUMBS_DIR.rglob("*"), reverse=True):
            if thumb.is_file() and thumb.resolve() not in expected_thumbs:
                thumb.unlink()
                removed_orphans += 1
            elif thumb.is_dir():
                try:
                    thumb.rmdir()
                except OSError:
                    pass

    after_bytes = sum(p.stat().st_size for p in media_files)
    thumbs_bytes = (
        sum(p.stat().st_size for p in THUMBS_DIR.rglob("*") if p.is_file())
        if THUMBS_DIR.exists()
        else 0
    )

    # 5. Actualizar siteContent.json
    if not SITE_CONTENT_PATH.exists():
        print(f"No se encontró {SITE_CONTENT_PATH}", file=sys.stderr)
        return 1

    with SITE_CONTENT_PATH.open("r", encoding="utf-8") as fp:
        site_content: dict[str, Any] = json.load(fp)

    daughter = site_content.setdefault("daughter", {})
    memories: list[dict[str, Any]] = site_content.setdefault("memories", [])

    for u_item in daughter.get("ultrasoundImages") or []:
        rewrite_item_urls(u_item, thumb_map)
    for b_item in daughter.get("bornImages") or []:
        rewrite_item_urls(b_item, thumb_map)
    for mem in memories:
        for m_item in mem.get("media") or []:
            rewrite_item_urls(m_item, thumb_map)
    for ms in daughter.get("milestones") or []:
        m_url = ms.get("mediaUrl")
        if isinstance(m_url, str) and m_url.startswith("./media/"):
            rel = url_to_rel_media(m_url)
            if rel and rel.suffix.lower() in RASTER_TO_WEBP_EXTS:
                webp_rel = rel.with_suffix(".webp")
                if (MEDIA_DIR / webp_rel).exists():
                    ms["mediaUrl"] = rel_media_to_url(webp_rel)

    # Recolectar URLs ya indexadas
    indexed_urls: set[str] = set()
    for item in daughter.get("ultrasoundImages") or []:
        if item.get("url"):
            indexed_urls.add(item["url"])
    for item in daughter.get("bornImages") or []:
        if item.get("url"):
            indexed_urls.add(item["url"])
    for mem in memories:
        for item in mem.get("media") or []:
            if item.get("url"):
                indexed_urls.add(item["url"])

    # Indexar archivos nuevos automáticamente
    new_indexed = 0
    existing_ids: set[str] = set()
    for mem in memories:
        for item in mem.get("media") or []:
            if item.get("id"):
                existing_ids.add(item["id"])

    for src in media_files:
        rel = src.relative_to(MEDIA_DIR)
        url = rel_media_to_url(rel)
        if url in indexed_urls:
            continue

        ext = src.suffix.lower()
        media_type = "video" if ext in VIDEO_EXTS else "image"
        thumb_rel = thumb_map.get(rel.as_posix())
        new_item: dict[str, Any] = {
            "id": f"scan-{rel.stem}-{new_indexed + 1}",
            "type": media_type,
            "url": url,
            "caption": "Nuevo recuerdo de Vaiolet"
            if rel.parts[0] == "vaiolet"
            else "Nuevo recuerdo juntos",
        }
        if thumb_rel:
            new_item["thumbUrl"] = rel_media_to_url(Path("thumbs") / thumb_rel)

        if rel.parts[0] == "vaiolet":
            born_images = daughter.setdefault("bornImages", [])
            born_images.append(new_item)
        elif rel.parts[0] == "ecografias":
            eco_mem = next((m for m in memories if m.get("id") == "mem-eco-vaiolet"), None)
            if eco_mem is not None:
                eco_mem.setdefault("media", []).append(new_item)
        else:
            file_date = extract_date_from_file(src)
            target_mem = next((m for m in memories if m.get("date") == file_date), None)
            if target_mem is None:
                target_mem = {
                    "id": f"mem-scan-{file_date}",
                    "title": f"Recuerdos del {file_date}",
                    "date": file_date,
                    "category": "vaiolet" if daughter.get("status") == "born" else "especial",
                    "isFavorite": False,
                    "location": "En familia",
                    "description": "Momentos importados automáticamente desde la galería.",
                    "tags": ["Galería", "Familia"],
                    "media": [],
                }
                memories.append(target_mem)
            target_mem.setdefault("media", []).append(new_item)

        indexed_urls.add(url)
        new_indexed += 1

    # 6. Guardar ambos JSON sincronizados
    serialized = json.dumps(site_content, ensure_ascii=False, indent=2) + "\n"
    SITE_CONTENT_PATH.write_text(serialized, encoding="utf-8")
    DEFAULT_CONTENT_PATH.parent.mkdir(parents=True, exist_ok=True)
    DEFAULT_CONTENT_PATH.write_text(serialized, encoding="utf-8")

    print("=== Re-escaneo y Optimización de Galería ===")
    print(f"Archivos multimedia totales : {len(media_files)}")
    print(f"Convertidos a WebP          : {converted_count}")
    print(f"Miniaturas WebP generadas   : {thumbs_generated}")
    print(f"Pósters de video generados  : {posters_generated}")
    print(f"Miniaturas huérfanas borradas: {removed_orphans}")
    print(f"Nuevos archivos indexados   : {new_indexed}")
    print(f"Peso galería antes          : {format_mb(before_bytes)}")
    print(f"Peso galería después        : {format_mb(after_bytes)}")
    print(f"Peso miniaturas/pósters     : {format_mb(thumbs_bytes)}")
    print(f"Sincronizado                : {SITE_CONTENT_PATH.name} -> {DEFAULT_CONTENT_PATH.relative_to(BASE_DIR)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
