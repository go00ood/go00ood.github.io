"""Extract small static previews from the same XML files as the corpus viewers."""

import json
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SOURCES = {
    "/posts/sohak-parallel-corpus/": "sohak_parallel_corpus.xml",
    "/posts/gugeupbang-parallel-corpus/": "gugeupbang_parallel_corpus.xml",
}


def build():
    previews = {}
    for url, filename in SOURCES.items():
        root = ET.parse(ROOT / "assets/data" / filename).getroot()
        if root.tag != "parallel_corpus":
            raise ValueError(f"Unexpected corpus format: {filename}")
        groups = []
        for group in root.findall("align_group")[:2]:
            documents = []
            for document in group.findall("document"):
                sentences = []
                for sentence in document.findall("sent[@type='main']"):
                    if sentence.get("lang") not in ("chi", "kor"):
                        continue
                    sentences.append({
                        "lang": sentence.get("lang"),
                        "text": "".join(sentence.itertext()),
                        "vol": sentence.get("vol", ""),
                        "page": sentence.get("page", ""),
                        "line": sentence.get("n", ""),
                    })
                documents.append({
                    "name": document.get("name", ""),
                    "status": document.get("status", ""),
                    "sentences": sentences,
                })
            groups.append({"id": group.get("id", ""), "documents": documents})
        if not groups:
            raise ValueError(f"Empty corpus: {filename}")
        previews[url] = {"source": "/assets/data/" + filename, "groups": groups}
    output = ROOT / "_data/corpus_previews.json"
    output.write_text(json.dumps(previews, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Generated static previews for {len(previews)} corpus pages")


if __name__ == "__main__":
    build()
