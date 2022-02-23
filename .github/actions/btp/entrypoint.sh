#!/bin/bash
set -e

INPUT_USERNAME=${INPUT_USERNAME:-$CF_USERNAME}
INPUT_PASSWORD=${INPUT_PASSWORD:-$CF_PASSWORD}
btp login --user "${INPUT_USERNAME}" --password "${INPUT_PASSWORD}" --subdomain "${INPUT_SUBDOMAIN}"

if [ ! -z "${INPUT_SUBACCOUNT_ID}" ]; then
  btp target --subaccount "${INPUT_SUBACCOUNT_ID}"
fi

if [ ! -z "${INPUT_COMMAND}" ]; then
  ${INPUT_COMMAND}
fi
