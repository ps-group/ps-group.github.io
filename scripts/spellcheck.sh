#!/usr/bin/env bash
# usage: spellcheck.sh <directory>

DIRECTORY=$1
if [ -d "$DIRECTORY" ]; then
  yaspeller --ignore-latin --ignore-digits --report html -e ".md" "$DIRECTORY"
else
  echo ERROR: "$DIRECTORY" does not exist
fi
