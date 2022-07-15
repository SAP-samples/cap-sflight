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
- `@sap/cds-dk` >= 6.0.1

## Add Deployment Files

CAP tooling provides your a Helm chart for deployment to Kyma.

Add the CAP Helm chart with the required features to this project:

```bash
cds add helm
cds add helm:html5_apps_deployer
```

## Configuration

This project contains a pre-configured configuration file `deployment/kyma/values.yaml`, you just need to do the following changes in this file:

- `<your-container-registry>` - full-qualified hostname of your container registry
- `domain`- full-qualified domain name used to access applications in your Kyma cluster

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

```
bash deployment/kyma/scripts/create-db-secret.sh sflight-db
```

## Build - Node.js

Do the following steps if you want to deploy the **Node.js** application.

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

## Build - Java

Do the following steps if you want to deploy the **Java** application.

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

## Build HTML5 application deployer image

```
bash deployment/kyma/scripts/build-ui-image.sh
```

## Push docker images

You can push all the docker images to your docker registry, using:

```
docker push $YOUR_CONTAINER_REGISTRY/sflight-hana-deployer
docker push $YOUR_CONTAINER_REGISTRY/sflight-srv
docker push $YOUR_CONTAINER_REGISTRY/sflight-html5-deployer
```

## Deployment

```
helm upgrade sflight ./chart --install -f deployment/kyma/values.yaml
```

## Access the UI

1. Create Launchpad Service subscription in the BTP Cockpit
2. Create a role collection `sflight`
3. Add role `admin` of `sflight.tXYZ` application to role collection
4. Add your user to the role collection
5. Goto **HTML5 Applications**
6. Start HTML5 application `sapfecaptravel`

Additionally, you can add the UI to a Launchpad Service site like it is described in in the last two steps of [this tutorial](https://developers.sap.com/tutorials/btp-app-kyma-launchpad-service.html#9aab2dd0-18ea-4ccd-bc44-24e87c845740).
