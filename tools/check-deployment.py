"""Check generated search files before uploading a GitHub Pages artifact."""

import argparse
from pathlib import Path
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET


def check(destination, site_url):
    destination = destination.resolve()
    expected = site_url.rstrip("/")
    origin = urlsplit(expected)
    if origin.scheme != "https" or not origin.netloc or origin.query or origin.fragment:
        raise ValueError("Site URL must be an absolute HTTPS URL")

    def local_file(url):
        parsed = urlsplit(url)
        if (parsed.scheme, parsed.netloc) != (origin.scheme, origin.netloc):
            raise ValueError(f"Unexpected sitemap origin: {url}")
        prefix = origin.path.rstrip("/") + "/"
        if not parsed.path.startswith(prefix) or parsed.query or parsed.fragment:
            raise ValueError(f"Unexpected sitemap URL: {url}")
        relative = unquote(parsed.path[len(prefix):])
        target = (destination / relative).resolve()
        if not target.is_relative_to(destination):
            raise ValueError(f"Path outside artifact: {url}")
        if parsed.path.endswith("/"):
            target /= "index.html"
        if not target.is_file():
            raise ValueError(f"Sitemap target is missing from artifact: {url}")
        return target

    root = ET.parse(destination / "sitemap.xml").getroot()
    namespace = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
    if root.tag != namespace + "urlset":
        raise ValueError("Expected a sitemap urlset")
    urls = [(element.text or "").strip() for element in root.findall(namespace + "url/" + namespace + "loc")]
    if not urls or len(urls) != len(set(urls)):
        raise ValueError("Sitemap is empty or contains duplicate URLs")
    if expected + "/" not in urls:
        raise ValueError("Homepage is missing from sitemap")
    targets = {local_file(url) for url in urls}
    # The posts directory itself can contain a generated index/redirect page.
    # Only nested directories represent posts under /posts/:title/.
    posts = {
        path for path in (destination / "posts").glob("**/index.html")
        if path.parent != destination / "posts"
    }
    if not posts:
        raise ValueError("No generated posts found")
    missing = posts - targets
    if missing:
        raise ValueError("Generated posts missing from sitemap: " + ", ".join(str(path.relative_to(destination)) for path in sorted(missing)))
    robots = (destination / "robots.txt").read_text(encoding="utf-8")
    declarations = [line.split(":", 1)[1].strip() for line in robots.splitlines() if line.lower().startswith("sitemap:")]
    if expected + "/sitemap.xml" not in declarations:
        raise ValueError("robots.txt does not declare this site's sitemap")
    print(f"Deployment check passed: {len(urls)} sitemap URLs, {len(posts)} posts")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--destination", type=Path, default=Path("_site"))
    parser.add_argument("--url", required=True)
    args = parser.parse_args()
    try:
        check(args.destination, args.url)
    except (ValueError, OSError, ET.ParseError) as error:
        parser.exit(1, f"Deployment check failed: {error}\n")
