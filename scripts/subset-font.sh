#!/usr/bin/env sh
# Rebuilds src/assets/fonts/archivo-subset.woff2 from Fontsource's Archivo variable font.
# Needs fonttools + brotli:  pip install fonttools brotli
# Add characters to UNICODES if the copy starts using new ones (e.g. other accented letters).
set -e
SRC=node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2
TMP=$(mktemp -d)
UNICODES="U+0020-007E,U+00A0,U+00A9,U+00B7,U+00C9,U+00D7,U+00E9,U+2013,U+2018-201D,U+2026,U+2190-2193,U+2197"
python -m fontTools.varLib.instancer "$SRC" wght=400:900 -o "$TMP/archivo.ttf"
pyftsubset "$TMP/archivo.ttf" --unicodes="$UNICODES" \
  --layout-features="kern,liga,calt,tnum,lnum,case" --flavor=woff2 \
  --output-file=src/assets/fonts/archivo-subset.woff2
rm -rf "$TMP"
echo "wrote src/assets/fonts/archivo-subset.woff2"
