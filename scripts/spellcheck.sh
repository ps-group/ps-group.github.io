#!/usr/bin/env bash
# usage: spellcheck.sh <directory>

SCRIPT_DIR=$(dirname $(realpath "$0"))
DIRECTORY=$1

if [ -d "$DIRECTORY" ]; then
  yaspeller --ignore-latin --ignore-digits --dictionary "$SCRIPT_DIR/dict_ru.json" --report html -e ".md" "$DIRECTORY"
else
  echo ERROR: directory "'$DIRECTORY'" does not exist
fi
