#!/bin/sh
if [ -z "$husky_skip_init" ]; then
  case "$-" in
    *i*) exec bash -i -c ". $(dirname "$0")/husky.sh" "$@" ;;
    *) exec bash -c ". $(dirname "$0")/husky.sh" "$@" ;;
  esac
fi
