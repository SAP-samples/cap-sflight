# Deployment to SAP Business Technology Platform - Kyma Runtime

- [Deployment to SAP Business Technology Platform - Kyma Runtime](#deployment-to-sap-business-technology-platform---kyma-runtime)
  - [Preconditions](#preconditions)
  - [Add Deployment Files](#add-deployment-files)
  - [Configuration](#configuration)
  - [Prepare Kubernetes Namespace](#prepare-kubernetes-namespace)
    - [Create container registry secret](#create-container-registry-secret)
    - [Create a secret for your HDI container](#create-a-secret-for-your-hdi-container)
  - [Build - Node.js](#build---nodejs)
  - [Build - Java](#build---java)
  - [Build HTML5 application deployer image](#build-html5-application-deployer-image)
  - [Push docker images](#push-docker-images)
  - [Deployment](#deployment)
  - [Access the UI](#access-the-ui)

**TIP:** You can find more information in the [Deploy Your CAP Application on SAP BTP Kyma Runtime](https://developers.sap.com/mission.btp-deploy-cap-kyma.html) tutorial and in the [Deploy to Kyma/K8s](https://cap.cloud.sap/docs/guides/deployment/deploy-to-kyma) guide of the CAP documentation.

## Preconditions

- BTP Subaccount with Kyma Runtime
- BTP Subaccount with Cloud Foundry Space
- HANA Cloud instance available for your Cloud Foundry space
- BTP Entitlements for: *HANA HDI Services & Container* plan *hdi-shared*, *Launchpad Service* plan *standard*
- Container Registry
- Command Line Tools: `kubectl`, `kubectl-oidc_login`, `pack`, `docker`, `helm`, `cf`
- Logged into Kyma Runtime (with `kubectl` CLI), Cloud Foundry space (with `cf` CLI) and Container Registry (with `docker login`)
- `@sap/cds-dk` >= 6.6.0

## Add Deployment Files

CAP tooling provides your a Helm chart for deployment to Kyma.

Add the CAP Helm chart with the required features to this project:

```bash
cds add helm
cds add html5-repo
```

## Prepare Kubernetes Namespace

1. Export the kubeconfig.yaml

    ```
    set KUBECONFIG=~/.kube/cap-kyma-app-config
    ```

2. Setting the namespace

    ```
    kubectl config set-context --current --namespace=<<NAMESPACE>>
    ```

### Create container registry secret

Create a secret `container-registry` with credentials to access the container registry:

```
bash deployment/kyma/scripts/create-container-registry-secret.sh
```

The *Docker Server* is the full-qualified hostname of your container registry.

### Create a secret for your HDI container

This step is only required if you're using a BTP Trial account. If you're using a production or a free tier account then you can create HDI Container from Kyma directly by adding a [mapping to your Kyma namespace in your HANA Cloud Instance](https://blogs.sap.com/2022/12/15/consuming-sap-hana-cloud-from-the-kyma-environment/) and skip this step.

```
bash deployment/kyma/scripts/create-db-secret.sh sflight-db
```

It will create a HDI container `sflight-db` instance on your currently targeted Cloud Foundry space and creates a secret `sflight-db` with the credentials in your current Kubernetes namespace.

Make the following changes to your _`chart/values.yaml`_.

```diff
srv:
  bindings:
    db:
-     serviceInstanceName: hana
+     fromSecret: sflight-db
...

hana-deployer:
  bindings:
    hana:
-     serviceInstanceName: hana
+     fromSecret: sflight-db

...
- hana:
-   serviceOfferingName: hana
-   servicePlanName: hdi-shared
```

## Configuration

Make the following changes to your _`chart/values.yaml`_ file:

1. Change value of `global.domain` key to your cluster domain.

2. Replace `<your-container-registry>` with your container registry.

3. Set the value of `SAP_CLOUD_SERVICE` key.

```diff
html5-apps-deployer:
  env:
-    SAP_CLOUD_SERVICE: null
+    SAP_CLOUD_SERVICE: sap.fe.cap.sflight
```

4. Add backend destinations required by HTML5 Apps Deployer.
   
```diff
-  backendDestinations: {}
+  backendDestinations:
+     sflight-srv:
+       service: srv
```

5. Add your image registry secret created in [Create container registry secret](#create-container-registry-secret) step.

```diff
global:
  domain: null
-  imagePullSecret: {}
+  imagePullSecret:
+    name: container-registry
```

## Build - Node.js

Do the following steps if you want to deploy the **Node.js** application.

The `CDS_ENV=node` env variable needs to be provided to build for Node.js. The application will be built for Java by default.

```
CDS_ENV=node cds build --production
```
**Build data base deployer image:**

```bash
pack build $YOUR_CONTAINER_REGISTRY/sflight-hana-deployer \
     --path gen/db \
     --buildpack gcr.io/paketo-buildpacks/nodejs \
     --builder paketobuildpacks/builder-jammy-base \
     --env BP_NODE_RUN_SCRIPTS=""
```
(Replace `$YOUR_CONTAINER_REGISTRY` with the full-qualified hostname of your container registry)

**Build image for CAP service:**

```bash
pack build $YOUR_CONTAINER_REGISTRY/sflight-srv \
     --path "gen/srv" \
     --buildpack gcr.io/paketo-buildpacks/nodejs \
     --builder paketobuildpacks/builder-jammy-base \
     --env BP_NODE_RUN_SCRIPTS=""
```

## Build - Java

Do the following steps if you want to deploy the **Java** application.

**Build data base deployer image:**

```bash
cds build --production
```

```bash
pack build $YOUR_CONTAINER_REGISTRY/sflight-hana-deployer \
     --path gen/db \
     --buildpack gcr.io/paketo-buildpacks/nodejs \
     --builder paketobuildpacks/builder-jammy-base \
     --env BP_NODE_RUN_SCRIPTS=""
```

(Replace `$YOUR_CONTAINER_REGISTRY` with the full-qualified hostname of your container registry)

**Build image for CAP service:**

```bash
mvn package
```

```bash
pack build $YOUR_CONTAINER_REGISTRY/sflight-srv \
     --path srv/target/*-exec.jar \
     --buildpack gcr.io/paketo-buildpacks/sap-machine \
     --buildpack gcr.io/paketo-buildpacks/java \
     --builder paketobuildpacks/builder-jammy-base \
     --env SPRING_PROFILES_ACTIVE=cloud \
     --env BP_JVM_VERSION=17
```

## Build HTML5 application deployer image

```
bash deployment/kyma/scripts/build-ui-image.sh
```

## Push docker images

You can push all the docker images to your docker registry, using:

```bash
docker push $YOUR_CONTAINER_REGISTRY/sflight-hana-deployer
docker push $YOUR_CONTAINER_REGISTRY/sflight-srv
docker push $YOUR_CONTAINER_REGISTRY/sflight-html5-deployer
```

## Deployment

```bash
helm install sflight ./chart --set-file xsuaa.jsonParameters=xs-security.json
```

## Access the UI

1. Create Launchpad Service subscription in the BTP Cockpit
2. Create a role collection `sflight`
3. Add role `admin` of `sflight.tXYZ` application to role collection
4. Add your user to the role collection
5. Goto **HTML5 Applications**
6. Start HTML5 application `sapfecaptravel`

Additionally, you can add the UI to a Launchpad Service site like it is described in in the last two steps of [this tutorial](https://developers.sap.com/tutorials/btp-app-kyma-launchpad-service.html#9aab2dd0-18ea-4ccd-bc44-24e87c845740).
