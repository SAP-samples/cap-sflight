FROM mcr.microsoft.com/devcontainers/typescript-node:1-20-bookworm

RUN wget -q -O - https://packages.cloudfoundry.org/debian/cli.cloudfoundry.org.key | sudo apt-key add -
RUN echo "deb https://packages.cloudfoundry.org/debian stable main" | sudo tee /etc/apt/sources.list.d/cloudfoundry-cli.list

# install Linux packages
RUN sudo apt-get update 
RUN sudo apt-get install cf8-cli

# install npm packages
RUN npm install -g mbt @sap/cds-dk

# addtional plugins to Cloud Foundry
RUN cf install-plugin -f multiapps