#!/bin/bash

set -e
cd "$(dirname "$(npm root)")"
DIR="$(pwd)"

npm install --no-save yaml

function value() {
    node "$DIR/deployment/kyma/scripts/value.js" "$1"
}

function image() {
    local REPOSITORY="$(value "$1.image.repository")"
    local TAG="$(value "$1.image.tag")"
    if [ "$TAG" != "" ]; then
        echo "$REPOSITORY:$TAG"
    else
        echo "$REPOSITORY"
    fi
}

rm -rf gen/ui
mkdir -p gen/ui/resources

CLOUD_SERVICE="$(value html5_apps_deployer.cloudService)"
DESTINATIONS="$(value html5_apps_deployer.backendDestinations)"

IMAGE="$(image html5_apps_deployer)"

for APP in app/*; do
    if [ -f "$APP/webapp/manifest.json" ]; then
        echo "Build $APP..."
        echo

        rm -rf "gen/$APP"
        mkdir -p "gen/app"
        cp -r "$APP" gen/app
        pushd >/dev/null "gen/$APP"

        node "$DIR/deployment/kyma/scripts/prepareUiFiles.js" $CLOUD_SERVICE $DESTINATIONS
        npm install
        npx ui5 build preload --clean-dest --config ui5-deploy.yaml --include-task=generateManifestBundle generateCachebusterInfo
        cd dist
        rm manifest-bundle.zip
        mv *.zip "$DIR/gen/ui/resources"

        popd >/dev/null
    fi
done

cd gen/ui

echo
echo "HTML5 Apps:"
ls -l resources
echo

cat >package.json <<EOF
{
    "name": "ui-deployer",
    "scripts": { "start": "node node_modules/@sap/html5-app-deployer/index.js" }
}
EOF

npm install @sap/html5-app-deployer
pack build $IMAGE --path . --buildpack gcr.io/paketo-buildpacks/nodejs --builder paketobuildpacks/builder:base