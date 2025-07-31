#!/bin/sh
set -e

# Homebrew
if ! type brew >/dev/null 2>&1; then
    NONINTERACTIVE=1 su vscode -s /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

    echo >> /home/vscode/.bashrc
    echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> /home/vscode/.bashrc
    eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
fi

su vscode -s /bin/bash -c "brew install cloudfoundry/tap/cf-cli@8"
su vscode -s /bin/bash -c "cf install-plugin -f multiapps"

npm i -g mbt
