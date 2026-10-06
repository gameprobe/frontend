"""Update the existing frontend image entry without rewriting other YAML fields."""

import re
import sys
from pathlib import Path

IMAGE_NAME = "seocj/gameprobe-frontend"


def update_manifest(text: str, digest: str, source_sha: str) -> str:
    if not re.fullmatch(r"sha256:[0-9a-f]{64}", digest):
        raise ValueError("Expected a sha256 image digest with 64 lowercase hex digits.")
    if not re.fullmatch(r"[0-9a-f]{40}", source_sha):
        raise ValueError("Expected the full 40-character frontend commit SHA.")

    # This intentionally accepts the repository's existing block format only.
    # Unexpected structures fail instead of silently changing the wrong image.
    sections = list(re.finditer(r"^images:[ \t]*(?:#.*)?$", text, re.MULTILINE))
    if len(sections) != 1:
        raise ValueError("Expected exactly one top-level images block.")
    start = sections[0].end()
    next_section = re.search(r"^[^\s#]", text[start:], re.MULTILINE)
    end = start + next_section.start() if next_section else len(text)
    images = text[start:end]

    entries = list(re.finditer(r"^  - .*$", images, re.MULTILINE))
    targets = [
        index for index, entry in enumerate(entries)
        if re.fullmatch(r"  - name: " + re.escape(IMAGE_NAME) + r"[ \t]*(?:#.*)?", entry.group())
    ]
    if len(targets) != 1:
        raise ValueError("Expected exactly one frontend image entry in the existing format.")
    index = targets[0]
    entry_start = entries[index].start()
    entry_end = entries[index + 1].start() if index + 1 < len(entries) else len(images)
    entry = images[entry_start:entry_end]

    digest_pattern = r"^(    digest: )sha256:[0-9a-f]{64}([ \t]*(?:#.*)?)$"
    comment_pattern = r"^(    # Published from frontend main commit )[0-9a-f]{40}(\.[ \t]*)$"
    if len(re.findall(digest_pattern, entry, re.MULTILINE)) != 1:
        raise ValueError("Expected exactly one existing frontend digest.")
    if len(re.findall(comment_pattern, entry, re.MULTILINE)) != 1:
        raise ValueError("Expected exactly one frontend source-commit comment.")
    for line in entry.splitlines()[1:]:
        if line.strip() and not line.lstrip().startswith("#") and not re.fullmatch(digest_pattern, line):
            raise ValueError("Unexpected frontend image field; review the manifest format first.")

    updated = re.sub(digest_pattern, lambda match: match[1] + digest + match[2], entry, flags=re.MULTILINE)
    updated = re.sub(comment_pattern, lambda match: match[1] + source_sha + match[2], updated, flags=re.MULTILINE)
    return text[:start] + images[:entry_start] + updated + images[entry_end:] + text[end:]


def main() -> int:
    if len(sys.argv) != 4:
        print("Usage: update-deploy-image.py MANIFEST IMAGE_DIGEST FRONTEND_SHA", file=sys.stderr)
        return 1
    path = Path(sys.argv[1])
    try:
        original = path.read_text(encoding="utf-8")
        updated = update_manifest(original, sys.argv[2], sys.argv[3])
        if updated != original:
            path.write_text(updated, encoding="utf-8")
            print("Updated frontend image digest and source commit.")
        else:
            print("Frontend image is already up to date.")
    except (OSError, ValueError) as error:
        print(f"Cannot update deployment manifest: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
