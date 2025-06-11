#!/bin/bash

set -e
cd "$(dirname "$(dirname "$0")")"
. ./scripts/values.sh

if true-value 2>/dev/null .saas_registry.enabled; then
  echo >&2 "[ERROR] DB secret only required for single tenancy apps"
fi

NAME="$1"
if [ "$NAME" == "" ]; then
  if [ ! -f "chart/values.yaml" ]; then
    echo >&2 "[ERROR] Please either specify the name for the DB secret or maintain it in the Helm chart"
    exit 1
  fi
  NAME="$(value .srv.bindings.db.fromSecret)"
  if [ "$NAME" == "" -o "$NAME" == "<nil>" ]; then
    echo >&2 "[ERROR] Please either specify the name for the DB secret or maintain it in the Helm chart"
    exit 1
  fi
fi

SECRET_HEADER="$(cat <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: $NAME
type: Opaque
stringData:
  .metadata: |
    {
      "credentialProperties":
        [
          { "name": "certificate", "format": "text"},
          { "name": "database_id", "format": "text"},
          { "name": "driver", "format": "text"},
          { "name": "hdi_password", "format": "text"},
          { "name": "hdi_user", "format": "text"},
          { "name": "host", "format": "text"},
          { "name": "password", "format": "text"},
          { "name": "port", "format": "text"},
          { "name": "schema", "format": "text"},
          { "name": "url", "format": "text"},
          { "name": "user", "format": "text"}
        ],
      "metaDataProperties":
        [
          { "name": "plan", "format": "text" },
          { "name": "label", "format": "text" },
          { "name": "type", "format": "text" },
          { "name": "tags", "format": "json" }
        ]
    }
  type: hana
  label: hana
  plan: hdi-shared
  tags: '[ "hana", "database", "relational" ]'
EOF
)"

cf 2>/dev/null >/dev/null service $NAME || cf create-service hana hdi-shared $NAME
while true; do
    STATUS="$(cf 2>/dev/null service $NAME | grep status: | head -n 1)"
    echo $STATUS
    if [[ "$STATUS" = *succeeded* ]]; then
        break
    fi
    sleep 1
done

cf create-service-key $NAME $NAME-key

node "$(dirname "$1")/scripts/format-kyma-secret.js" -- "$(echo "$SECRET_HEADER")" "$(cf service-key $NAME $NAME-key)" | kubectl apply -f -
echo
echo "HANA DB Kubernetes secret '$NAME' created."
echo
echo "You can view it using:"
echo
echo "kubectl get secret $NAME -o yaml"
exit 0