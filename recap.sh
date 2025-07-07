#!/usr/bin/env bash

set -euo pipefail

# Setup Project
git clone https://github.com/SAP-samples/cap-sflight/
cd cap-sflight
git checkout 686f55c4aef86c82a71dfc7d4280d80e2b85bae8 # for reproducibility

cds --version
cds add ams
git diff HEAD

mvn clean verify
