#!/bin/bash

read -p "Docker Server: " DOCKER_SERVER

read -p "User ($USER): " DOCKER_USER
if [ "$DOCKER_USER" == "" ]; then
    DOCKER_USER="$USER"
fi

if [ "$EMAIL" == "" ]; then
    read -p "EMail: " DOCKER_EMAIL
else
    read -p "EMail ($EMAIL): " DOCKER_EMAIL
    if [ "$DOCKER_EMAIL" == "" ]; then
        DOCKER_EMAIL="$EMAIL"
    fi
fi

read -sp "API Key: " API_KEY

echo
echo

kubectl create secret docker-registry container-registry \
    "--docker-server=$DOCKER_SERVER" \
    "--docker-username=$DOCKER_USER" \
    "--docker-email=$DOCKER_EMAIL" \
    "--docker-password=$API_KEY"
