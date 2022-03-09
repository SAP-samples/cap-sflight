FROM buildpack-deps:stretch-curl

# https://blogs.sap.com/2021/09/01/sap-tech-bytes-btp-cli-installation/
RUN curl -s -O --location --url "https://raw.githubusercontent.com/SAP-samples/sap-tech-bytes/2021-09-01-btp-cli/getbtpcli" && \
    chmod +x getbtpcli && \
    echo | ./getbtpcli && \
    mv $HOME/bin/btp* /usr/local/bin/

COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
