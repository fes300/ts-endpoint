#!/usr/bin/env bash

set -e -x

# pnpm release-please --help

release-please release-pr \
  --repo-url ascariandrea/ts-endpoint \
  --token ./gh-token.txt \
  --config-file release-please-config.json \
  --debug \
  --dry-run