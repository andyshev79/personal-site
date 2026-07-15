#!/bin/bash
set -euo pipefail

# This is a static site (HTML/CSS/JS) with a stdlib-only Python sync script,
# so there are no package managers to install. This hook just verifies the
# runtimes used to validate changes (node for JS syntax checks, python3 for
# scripts/fetch_telegram.py) are present.

command -v python3 >/dev/null || { echo "python3 not found" >&2; exit 1; }
command -v node >/dev/null || { echo "node not found" >&2; exit 1; }

python3 -m py_compile scripts/fetch_telegram.py

echo "Environment ready: python3 $(python3 --version 2>&1 | cut -d' ' -f2), node $(node --version)"
