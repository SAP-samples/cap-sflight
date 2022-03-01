FROM ppiper/cf-cli:v10

# needed for cf to find its config
# (GH resets HOME to /github/workspace)
ENV CF_HOME=$HOME

RUN cf install-plugin -r CF-Community "html5-plugin" -f

COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
