#!/bin/bash
set -eu

curl -v https://cognito-idp.$AWS_REGION.amazonaws.com/$USERPOOL_ID/.well-known/jwks.json
