
const Path = require('path');
const posixJoin = Path.posix.join;

function prepareUiFiles(path, options) {
    const { readFileSync, writeFileSync, existsSync } = require('fs');
    const Path = require('path');

    const srvDestination = getSrvDestination(options.destinations);

    const packageJsonInclude = getPackageJsonInclude();
    const ui5DeployTemplate = getUI5DeployTemplateYaml();
    const xsAppJsonTemplate = getXsAppTemplateJson();

    const packageJsonPath = Path.join(path, 'package.json');
    const manifestJsonPath = Path.join(path, 'webapp/manifest.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath));
    const manifestJson = JSON.parse(readFileSync(manifestJsonPath));

    // Adjust package.json
    packageJson.devDependencies = packageJsonInclude.devDependencies;
    packageJson.ui5 = packageJsonInclude.ui5;
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 4));

    // Adjust manifest.json
    console.log('Adjust webapp/manifest.json');
    manifestJson["sap.cloud"] = {
        "public": true,
        "service": options.cloudService || throwError(`Missing cloudService name`)
    };

    if (!existsSync(Path.join(path, 'xs-app.json'))) {
      const dataSources = manifestJson['sap.app'].dataSources || {};
      for (const dataSource of Object.values(dataSources)) {
          dataSource.uri = posixJoin('service', dataSource.uri);
      }
    }

    writeFileSync(manifestJsonPath, JSON.stringify(manifestJson, null, 4));

    // Add xs-app.json
    if (!existsSync(Path.join(path, 'xs-app.json'))) {
        console.log('Add xs-app.json');
        const xsAppJson = JSON.parse(JSON.stringify(xsAppJsonTemplate));
        xsAppJson.routes[0].destination = srvDestination || throwError('Expect srv destination');
        writeFileSync(Path.join(path, 'xs-app.json'), JSON.stringify(xsAppJson, null, 4));
    }

    // Add ui5-deploy.yaml
    if (!existsSync(Path.join(path, 'ui5-deploy.yaml'))) {
        console.log('Add ui5-deploy.yaml');
        const appId = manifestJson["sap.app"].id;
        const replacements = {
            "ID": appId,
            "ARCHIVENAME": appId.replace(/\./g, "")
        };

        const ui5Deploy = ui5DeployTemplate.replace(/\$([A-Z]+|)/g, (_, v) => replacements[v]);
        writeFileSync(Path.join(path, "ui5-deploy.yaml"), ui5Deploy);
    }
}

function throwError(msg) {
    throw new Error(msg);
}

function getPackageJsonInclude() {
    return {
        "name": "ui5-builde-root",
        "devDependencies": {
            "@ui5/cli": "^2.11.1",
            "@ui5/fs": "^2.0.6",
            "@ui5/logger": "^2.0.1",
            "@sap/ux-ui5-tooling": "1",
            "rimraf": "3.0.2",
            "@sap/ui5-builder-webide-extension": "1.0.x",
            "ui5-task-zipper": "^0.3.1",
            "mbt": "^1.0.15"
        },
        "ui5": {
            "dependencies": [
                "@sap/ui5-builder-webide-extension",
                "ui5-task-zipper",
                "mbt"
            ]
        }
    }
}

function getUI5DeployTemplateYaml() {
    return `specVersion: '2.4'
metadata:
  name: $ID
type: application
resources:
  configuration:
    propertiesFileSourceEncoding: UTF-8
builder:
  resources:
    excludes:
      - "/test/**"
      - "/localService/**"
  customTasks:
  - name: webide-extension-task-updateManifestJson
    beforeTask: generateManifestBundle
    configuration:
      appFolder: webapp
      destDir: dist
  - name: ui5-task-zipper
    afterTask: generateCachebusterInfo
    configuration:
      archiveName: $ARCHIVENAME
      additionalFiles:
      - xs-app.json`
}

function getXsAppTemplateJson() {
    return {
        "welcomeFile": "/index.html",
        "authenticationMethod": "route",
        "routes": [
          {
            "source": "^/service/(.*)$",
            "target": "$1",
            "destination": "overwrite-me",
            "authenticationType": "xsuaa",
            "csrfProtection": false
          },
          {
            "source": "^/resources/(.*)$",
            "target": "/resources/$1",
            "authenticationType": "none",
            "destination": "ui5"
          },
          {
            "source": "^/test-resources/(.*)$",
            "target": "/test-resources/$1",
            "authenticationType": "none",
            "destination": "ui5"
          },
          {
            "source": "^(.*)$",
            "target": "$1",
            "service": "html5-apps-repo-rt",
            "authenticationType": "xsuaa"
          }
        ]
      }

}

function getSrvDestination(destinations) {
  let destinationsJSON = JSON.parse(destinations);
  for (let key in destinationsJSON) {
    if(destinationsJSON[key].service === "srv") {
      return key;
    }
  }
}

if (process.argv[1].endsWith('prepareUiFiles.js')) {
    // Run in standalone mode
    prepareUiFiles('.', { cloudService: process.argv[2], destinations: process.argv[3] });
} else {
    module.exports = prepareUiFiles;
}