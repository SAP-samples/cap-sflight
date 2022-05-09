#!/bin/bash
set -e

INPUT_USERNAME=${INPUT_USERNAME:-$CF_USERNAME}
INPUT_PASSWORD=${INPUT_PASSWORD:-$CF_PASSWORD}
btp login --url "${INPUT_CLI_URL}" --user "${INPUT_USERNAME}" --password "${INPUT_PASSWORD}" --subdomain "${INPUT_SUBDOMAIN}"

if [ ! -z "${INPUT_SUBACCOUNT_ID}" ]; then
  btp target --subaccount "${INPUT_SUBACCOUNT_ID}"
fi

if [ ! -z "${INPUT_ROLE_COLLECTION}" ]; then
  btp assign security/role-collection ${INPUT_ROLE_COLLECTION} --to-user ${INPUT_USERNAME} > /dev/null

  if [ ! -z "${GRANT_USERS}" ]; then
    for user in ${GRANT_USERS//\\n/ }  # newline separated
    do
      btp assign security/role-collection ${INPUT_ROLE_COLLECTION} --to-user ${user} --create-user-if-missing
    done
  fi

fi

if [ ! -z "${INPUT_COMMAND}" ]; then
  ${INPUT_COMMAND}
fi
