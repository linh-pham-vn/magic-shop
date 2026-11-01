#!/bin/sh
# Builds the app and publishes dist/ to the gh-pages branch, which GitHub Pages serves at
# https://linh-pham-vn.github.io/magic-shop/
set -e
npm run build
cd dist
touch .nojekyll # tells GitHub Pages to serve the files as they are
git init -q -b gh-pages
git add -A
git -c user.name="$(git -C .. config user.name)" -c user.email="$(git -C .. config user.email)" commit -q -m "Publish site"
git push -f "$(git -C .. remote get-url origin)" gh-pages
rm -rf .git
