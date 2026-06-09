#!/usr/bin/env python3
"""
BAII — Build a "scene inventory" for lesson videos using OpenCV + YOLOv8.

Runs LOCALLY (not on Vercel). For each YouTube video it:
  1. downloads the stream (yt-dlp),
  2. samples frames with OpenCV,
  3. detects objects with YOLOv8 (pretrained on the 80 COCO classes),
  4. aggregates into {object: frames_seen} and writes src/data/video-inventory.json

The Next.js grader reads that JSON to fact-check student observations against
the ~80 detectable object types. Objects outside YOLO's vocabulary (shops,
walls, cloth, specific car models) are NOT in the inventory — the grader stays
neutral on those.

SETUP (one time):
    python3 -m venv .venv && source .venv/bin/activate
    pip install ultralytics opencv-python yt-dlp

RUN:
    python3 scripts/video_inventory.py Pnl-S-9udT4 yFM-7Ss2D3w G5-LApmkKIQ
    # (pass the YouTube video IDs used in src/data/pillar5.ts)

Notes:
  - First run downloads the YOLOv8n weights (~6 MB) automatically.
  - SAMPLE_EVERY_SEC controls how many frames are analysed (1 = one frame/sec).
  - MIN_FRAMES filters out spurious one-off detections from the final inventory.
"""

import json
import os
import sys
import tempfile

SAMPLE_EVERY_SEC = 1.0   # analyse one frame per second of video
CONF = 0.45              # YOLO confidence threshold
MIN_FRAMES = 3           # an object must appear in >= this many frames to count

OUT_PATH = os.path.join(os.path.dirname(__file__), "..", "src", "data", "video-inventory.json")


def download(video_id: str, dest_dir: str) -> str:
    import yt_dlp
    out = os.path.join(dest_dir, f"{video_id}.mp4")
    ydl_opts = {
        "format": "bestvideo[height<=480][ext=mp4]/best[height<=480]/best",
        "outtmpl": out,
        "quiet": True,
        "noplaylist": True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([f"https://www.youtube.com/watch?v={video_id}"])
    # yt-dlp may add an extension; find the actual file
    for f in os.listdir(dest_dir):
        if f.startswith(video_id):
            return os.path.join(dest_dir, f)
    return out


def analyse(path: str) -> dict:
    import cv2
    from ultralytics import YOLO

    model = YOLO("yolov8n.pt")  # smallest model; auto-downloads on first run
    cap = cv2.VideoCapture(path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    step = max(1, int(fps * SAMPLE_EVERY_SEC))

    counts: dict[str, int] = {}
    frames_sampled = 0
    idx = 0
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        if idx % step == 0:
            frames_sampled += 1
            res = model.predict(frame, conf=CONF, verbose=False)[0]
            seen = set()
            for c in res.boxes.cls.tolist():
                seen.add(model.names[int(c)])
            for label in seen:
                counts[label] = counts.get(label, 0) + 1
        idx += 1
    cap.release()

    objects = {k: v for k, v in counts.items() if v >= MIN_FRAMES}
    objects = dict(sorted(objects.items(), key=lambda kv: -kv[1]))
    return {"frames_sampled": frames_sampled, "objects": objects}


def main(video_ids: list[str]) -> None:
    inventory = {}
    if os.path.exists(OUT_PATH):
        with open(OUT_PATH) as f:
            inventory = json.load(f)

    with tempfile.TemporaryDirectory() as tmp:
        for vid in video_ids:
            print(f"▸ {vid}: downloading…")
            path = download(vid, tmp)
            print(f"▸ {vid}: analysing frames (this can take a few minutes)…")
            result = analyse(path)
            inventory[vid] = result
            print(f"  ✓ {result['frames_sampled']} frames · objects: {list(result['objects'])}")

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w") as f:
        json.dump(inventory, f, indent=2)
    print(f"\nWrote {OUT_PATH}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/video_inventory.py <videoId> [<videoId> ...]")
        sys.exit(1)
    main(sys.argv[1:])
