#!/bin/sh
set -e

export VERSION_SPECIFIER="${VERSION:+@${VERSION}}"

. ${NVM_DIR}/nvm.sh

npm i -g @sap/cds-dk${VERSION_SPECIFIER}
