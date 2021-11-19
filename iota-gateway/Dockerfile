ARG NODE_VERSION=14

########################################################################################
#
# This build stage retrieves the source code from GitHub. The default download is the 
# latest tip of the master of the named repository on GitHub.
#
# To obtain the latest stable release run this Docker file with the parameters:
# --no-cache --build-arg DOWNLOAD=stable
#
# To obtain any specific version of a release run this Docker file with the parameters:
# --no-cache --build-arg DOWNLOAD=1.7.0
#
# For development purposes, to create a development image including a running Distro, 
# run this Docker file with the parameter:
#
# --target=builder
#
######################################################################################## 
FROM node:${NODE_VERSION} AS builder
ARG GITHUB_ACCOUNT
ARG GITHUB_REPOSITORY
ARG DOWNLOAD
ARG SOURCE_BRANCH

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# As an Alternative for local development, just copy this Dockerfile into file the root of 
# the repository and replace the whole RUN statement below by the following COPY statement 
# in your local source using :
#
COPY ./app /opt/iota-gateway
#
WORKDIR /opt/iota-gateway

# hadolint ignore=DL3008
RUN \
  # Ensure that Git is installed prior to running npm install
  apt-get install -y --no-install-recommends git && \
  echo "INFO: npm install --production..." && \
  npm install --only=prod --no-package-lock --no-optional && \
  # Remove Git and clean apt cache
  apt-get clean && \
  apt-get remove -y git && \
  apt-get -y autoremove

USER node
ENV NODE_ENV=development

########################################################################################
#
# This build stage creates an anonymous user to be used with the distroless build
# as defined below.
#
########################################################################################
FROM node:${NODE_VERSION} AS anon-user
RUN sed -i -r "/^(root|nobody)/!d" /etc/passwd /etc/shadow /etc/group \
    && sed -i -r 's#^(.*):[^:]*$#\1:/sbin/nologin#' /etc/passwd


#
# The following creates a distroless build for production.
#

FROM gcr.io/distroless/nodejs:${NODE_VERSION}
ARG TARGET
ARG GITHUB_ACCOUNT
ARG GITHUB_REPOSITORY
ARG NODE_VERSION
ARG SOURCE_COMMIT
ENV GIT_COMMIT=$SOURCE_COMMIT

LABEL "maintainer"="FIWARE Foundation <fiware.eu@gmail.com>"
LABEL "org.opencontainers.image.authors"="https://www.fiware.org/contact-us/"
LABEL "org.opencontainers.image.documentation"="http://fiware-tutorials.rtfd.io/"
LABEL "org.opencontainers.image.vendor"="FIWARE Foundation"
LABEL "org.opencontainers.image.licenses"="MIT"
LABEL "org.opencontainers.image.title"="IOTA-MQTT Gateway"
LABEL "org.opencontainers.image.description"="Gateway between MQTT messages and the IOTA Tangle"
LABEL "org.nodejs.version"=${NODE_VERSION}

COPY --from=builder /opt/iota-gateway /opt/iota-gateway
WORKDIR /opt/iota-gateway

USER nobody
ENV NODE_ENV=production
CMD ["./bin/www"]

