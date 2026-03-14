#!/usr/bin/env sh

set -eu

WITH_TEST=0

for arg in "$@"; do
  if [ "$arg" = "--with-test" ]; then
    WITH_TEST=1
  fi
done

echo "[orchestra] start"
echo "[orchestra] running lint"
pnpm lint

echo "[orchestra] running typecheck"
pnpm typecheck

echo "[orchestra] running build"
pnpm build

if [ "$WITH_TEST" -eq 1 ]; then
  if pnpm run | grep -q " test"; then
    echo "[orchestra] running test"
    pnpm test
  else
    echo "[orchestra] test script not found, skipping"
  fi
fi

echo "[orchestra] done"
