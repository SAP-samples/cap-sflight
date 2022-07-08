# Welcome to the CAP SFLIGHT App

This is a sample app for the travel reference scenario, built with the [SAP Cloud Application Programming Model (CAP)](https://cap.cloud.sap) and [SAP Fiori Elements](https://experience.sap.com/fiori-design-web/smart-templates).

The purpose of this sample app is to:
* Demonstrate SAP Fiori annotations
* Demonstrate and compare SAP Fiori features on various stacks (CAP Node.js, CAP Java SDK, ABAP)
* Run UI test suites on various stacks

![Process Travels Page](img.png)

The app still contains some workarounds that are going to be addressed over time.
In some cases, the model and the handlers can be improved or simplified once further planned CAP features become available.
In other cases, the app itself could be improved. For example, calculation of the total price for a travel
currently simply sums up the single prices ignoring the currencies.

![](https://github.com/SAP-samples/cap-sflight/workflows/CI/badge.svg)
[![REUSE status](https://api.reuse.software/badge/github.com/SAP-samples/cap-sflight)](https://api.reuse.software/info/github.com/SAP-samples/cap-sflight)


## SAP Fiori UI with Node.js Backend

### Build and Run

In the root folder of your project run
```
npm ci
cds watch
```

### Accessing the SAP Fiori App

Open this link in your browser:
http://localhost:4004/travel_processor/webapp/index.html

### Integration Tests

To start OPA tests, open this link in your browser:
http://localhost:4004/travel_processor/webapp/test/integration/Opa.qunit.html

Test documentation is available at:
https://ui5.sap.com/#/api/sap.fe.test

## SAP Fiori UI with Java Backend

### Build and Run

In the root folder of your project run
```
npm ci
mvn spring-boot:run
```

To start the middleware, in another console execute
```
cd app\travel_processor
npm start
```

### Accessing the SAP Fiori App

Open this link in your browser:
http://localhost:8080/index.html

Note: If you access the CAP Java server directly without middleware, you will have to enter mock user credentials admin / admin which are maintained in file application.yml.


### Integration Tests

To start OPA tests, open this link in your browser:
http://localhost:8080/test/integration/Opa.qunit.html

Test documentation is available at:
https://ui5.sap.com/#/api/sap.fe.test

## Deployment to SAP Business Technology Platform

The project contains a configuration for deploying the CAP services and the SAP Fiori app to the SAP Business Technology Platform (SAP BTP) using a managed application router. The app then becomes visible in the content manager of the SAP Launchpad service.

The configuration file `mta.yaml` is for the Node.js backend of the app. If you want to deploy the Java backend, copy `mta-java.yaml` to `mta.yaml`.

### Prerequisites
#### SAP Business Technology Platform

- Create a [trial account on SAP BTP](https://www.sap.com/products/business-technology-platform/trial.html). See this [tutorial](https://developers.sap.com/tutorials/hcp-create-trial-account.html) for more information. Alternatively, you can use a sub-account in a productive environment.
- Subscribe to the [SAP Launchpad Service](https://developers.sap.com/tutorials/cp-portal-cloud-foundry-getting-started.html).
- Create an [SAP HANA Cloud Service instance](https://developers.sap.com/tutorials/btp-app-hana-cloud-setup.html#08480ec0-ac70-4d47-a759-dc5cb0eb1d58) or use an existing one.

#### Local Machine

- Install the Cloud Foundry command line interface (CLI). See this [tutorial](https://developers.sap.com/tutorials/cp-cf-download-cli.html) for more details.
- Install the [MultiApps CF CLI Plugin](https://github.com/cloudfoundry-incubator/multiapps-cli-plugin):

  ```shell
  cf add-plugin-repo CF-Community https://plugins.cloudfoundry.org
  cf install-plugin multiapps
  ```

- Install the [Cloud MTA Build Tool](https://github.com/SAP/cloud-mta-build-tool) globally:

  ```shell
  npm install -g mbt
   ```

### Build the Project

Build the project from the command line:

```shell
mbt build
```

The build results will be stored in the directory `mta_archives`.

### Deploy

1. Log in to the target space.
2. Deploy the MTA archive using the CF CLI: `cf deploy mta_archives/capire.sflight_1.0.0.mtar`

### Assign Role Collection

Any authorized user has read access to the app. For further authorization, assign a role collection to your user in the SAP BTP Cockpit:
* `sflight-reviewer-{spacename}` for executing actions *Accept Travel*, *Reject Travel*, and *Deduct Discount*
* `sflight-processor-{spacename}` for full write access

### Local Development with a HANA Cloud Instance

You need to have access to a HANA Cloud instance and SAP BTP.

1. Deploy the HDI content to a HANA HDI container (which is newly created on first call): `cds deploy --to hana`.
2. Start the application with the Spring Profile `cloud`.
   1. From Maven: `mvn spring-boot:run -Dspring-boot.run.profiles=cloud`
   2. From your IDE with the JVM argument `-Dspring.profiles.active=cloud` or env variable `spring.profiles.active=cloud`

The running application is now connected to its own HDI container/schema. Please keep in mind that the credentials for
that HDI container are stored locally on your filesystem (default-env.json).

## Deployment to SAP Business Technology Platform - Kyma Runtime

**TIP:** You can find more information in the [Deploy Your CAP Application on SAP BTP Kyma Runtime](https://developers.sap.com/mission.btp-deploy-cap-kyma.html) tutorial and in the [Deploy to Kyma/K8s](https://cap.cloud.sap/docs/guides/deployment/deploy-to-kyma) guide of the CAP documentation.

## Preconditions

- BTP Subaccount with Kyma Runtime
- BTP Subaccount with Cloud Foundry Space
- HANA Cloud instance available for your Cloud Foundry space
- BTP Entitlements for: *HANA HDI Services & Container* plan *hdi-shared*, *Launchpad Service* plan *standard*
- Container Registry
- Command Line Tools: `kubectl`, `kubectl-oidc_login`, `pack`, `docker`, `helm`, `cf`
- Logged into Kyma Runtime (with `kubectl` CLI), Cloud Foundry space (with `cf` CLI) and Container Registry (with `docker login`)
- `@sap/cds-dk` >= 6.0.1

### Add Deployment Files

CAP tooling provides your a Helm chart for deployment to Kyma.

Add the CAP Helm chart with the required features to this project:

```bash
cds add helm
cds add helm:html5_apps_deployer
```

### Configuration

This project contains a pre-configured configuration file `values.yaml`, you just need to do the following changes in this file:

- `<your-container-registry>` - full-qualified hostname of your container registry
- `domain`- full-qualified domain name used to access applications in your Kyma cluster

### Prepare Kubernetes Namespace

1. Export the kubeconfig.yaml

    ```
    set KUBECONFIG=~/.kube/cap-kyma-app-config
    ```

2. Setting the namespace

    ```
    kubectl config set-context --current --namespace=<<NAMESPACE>>
    ```

#### Create container registry secret

Create a secret `container-registry` with credentials to access the container registry:

```
bash ./scripts/create-container-registry-secret.sh
```

The *Docker Server* is the full-qualified hostname of your container registry.

#### Create a secret for your HDI container

```
bash ./scripts/create-db-secret.sh sflight-db
```

### Build - Node.js

The `CDS_ENV=node` env variable needs to be provided to build for Node.js. The application will be built for Java by default.

```
CDS_ENV=node cds build --production
```
**Build data base deployer image:**

```
pack build $YOUR_CONTAINER_REGISTRY/sflight-hana-deployer \
     --path gen/db \
     --buildpack gcr.io/paketo-buildpacks/nodejs:0.16.1 \
     --builder paketobuildpacks/builder:base
```
(Replace `$YOUR_CONTAINER_REGISTRY` with the full-qualified hostname of your container registry)

**Build image for CAP service:**

```
pack build \
     $YOUR_CONTAINER_REGISTRY/sflight-srv \
     --path "gen/srv" \
     --buildpack gcr.io/paketo-buildpacks/nodejs \
     --builder paketobuildpacks/builder:base
```

### Build - Java

**Build data base deployer image:**

```
cds build --production
```

```
pack build $YOUR_CONTAINER_REGISTRY/sflight-hana-deployer \
     --path db \
     --buildpack gcr.io/paketo-buildpacks/nodejs:0.16.1 \
     --builder paketobuildpacks/builder:base
```

(Replace `$YOUR_CONTAINER_REGISTRY` the full-qualified hostname of your container registry)

**Build image for CAP service:**

```
mvn package
```

```
pack build $YOUR_CONTAINER_REGISTRY/sflight-srv \
     --path srv/target/*-exec.jar \
     --buildpack gcr.io/paketo-buildpacks/sap-machine \
     --buildpack gcr.io/paketo-buildpacks/java \
     --builder paketobuildpacks/builder:base \
     --env SPRING_PROFILES_ACTIVE=cloud
```

### Build HTML5 application deployer image

```
bash ./scripts/build-ui-image.sh
```

### Push docker images

You can push all the docker images to your docker registry, using:

```
docker push $YOUR_CONTAINER_REGISTRY/sflight-hana-deployer
docker push $YOUR_CONTAINER_REGISTRY/sflight-srv
docker push $YOUR_CONTAINER_REGISTRY/sflight-html5-deployer
```

### Deployment

```
helm upgrade sflight ./chart --install -f values.yaml
```

### Access the UI

1. Create Launchpad Service subscription in the BTP Cockpit
2. Create a role collection `sflight`
3. Add role `admin` of `sflight.tXYZ` application to role collection
4. Add your user to the role collection
5. Goto **HTML5 Applications**
6. Start HTML5 application `sapfecaptravel`

Additionally, you can add the UI to a Launchpad Service site like it is described in in the last two steps of [this tutorial](https://developers.sap.com/tutorials/btp-app-kyma-launchpad-service.html#9aab2dd0-18ea-4ccd-bc44-24e87c845740).


## Creating an SAP Fiori App from Scratch

If you want to implement an SAP Fiori app, follow these tutorials:

* [Create a List Report Object Page App with SAP Fiori Tools](https://developers.sap.com/group.fiori-tools-lrop.html)
* [Developing SAP Fiori applications with SAP Fiori Tools](https://help.sap.com/viewer/17d50220bcd848aa854c9c182d65b699/Latest/en-US)

## Get Support

In case you've a question, find a bug, or otherwise need support, use the [SAP Community](https://answers.sap.com/tags/9f13aee1-834c-4105-8e43-ee442775e5ce) to get more visibility.

## License

Copyright (c) 2022 SAP SE or an SAP affiliate company. All rights reserved. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](LICENSES/Apache-2.0.txt) file.
