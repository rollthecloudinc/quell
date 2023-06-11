#!/bin/bash

# Path to the project's package.json
PROJECT_PACKAGE_JSON="../package.json"

# Directory path where the libraries are located
LIBRARIES_DIRECTORY="../modules"

# Get the list of library names
LIBRARY_NAMES=$(ls -d "${LIBRARIES_DIRECTORY}"/*/)

# echo $LIBRARY_NAMES

# Loop through each library
for LIBRARY_PATH in ${LIBRARY_NAMES}; do
  LIBRARY_NAME=$(basename "${LIBRARY_PATH}")

  echo $LIBRARY_NAME

  # Path to the library's package.json
  LIBRARY_PACKAGE_JSON="${LIBRARY_PATH}package.json"

  # Skip if the package.json file doesn't exist
  if [ ! -f "${LIBRARY_PACKAGE_JSON}" ]; then
    echo "Skipping library '${LIBRARY_NAME}' as package.json not found."
    continue
  fi

  # Read the library's package.json
  LIBRARY_PACKAGE_CONTENT=$(cat "${LIBRARY_PACKAGE_JSON}")

  # Get the current dependencies and peer dependencies from the library's package.json
  CURRENT_DEPENDENCIES=$(echo "${LIBRARY_PACKAGE_CONTENT}" | jq -r '.dependencies')
  CURRENT_PEER_DEPENDENCIES=$(echo "${LIBRARY_PACKAGE_CONTENT}" | jq -r '.peerDependencies')

  # Read the project's package.json
  PROJECT_PACKAGE_CONTENT=$(cat "${PROJECT_PACKAGE_JSON}")

  # Get the dependencies and peer dependencies from the project's package.json
  PROJECT_DEPENDENCIES=$(echo "${PROJECT_PACKAGE_CONTENT}" | jq -r '.dependencies')
  PROJECT_PEER_DEPENDENCIES=$(echo "${PROJECT_PACKAGE_CONTENT}" | jq -r '.peerDependencies')

  # Loop through each dependency in the library
  for DEPENDENCY in $(echo "${CURRENT_DEPENDENCIES}" | jq -r keys[]); do
    # Check if the dependency is present in the project's package.json
    if [[ -n $(echo "${PROJECT_DEPENDENCIES}" | jq -r --arg dep "${DEPENDENCY}" '.[$dep]') ]]; then
      # Update the dependency version in the library's package.json
      LIBRARY_PACKAGE_CONTENT=$(echo "${LIBRARY_PACKAGE_CONTENT}" | jq --arg dep "${DEPENDENCY}" \
        --arg version "$(echo "${PROJECT_DEPENDENCIES}" | jq -r --arg dep "${DEPENDENCY}" '.[$dep]')" \
        '.dependencies[$dep] = $version')
    fi
  done

  # Loop through each peer dependency in the library
  for PEER_DEPENDENCY in $(echo "${CURRENT_PEER_DEPENDENCIES}" | jq -r keys[]); do
    # Check if the peer dependency is present in the project's package.json
    if [[ -n $(echo "${PROJECT_PEER_DEPENDENCIES}" | jq -r --arg dep "${PEER_DEPENDENCY}" '.[$dep]') ]]; then
      # Update the peer dependency version in the library's package.json
      LIBRARY_PACKAGE_CONTENT=$(echo "${LIBRARY_PACKAGE_CONTENT}" | jq --arg dep "${PEER_DEPENDENCY}" \
        --arg version "$(echo "${PROJECT_PEER_DEPENDENCIES}" | jq -r --arg dep "${PEER_DEPENDENCY}" '.[$dep]')" \
        '.peerDependencies[$dep] = $version')
    fi
  done

  # Save the updated package.json content back to the library's package.json file
  echo "${LIBRARY_PACKAGE_CONTENT}" > "${LIBRARY_PACKAGE_JSON}"
done
