import os
import urllib.request

region = os.environ.get('REGION')
user_pool_id = os.environ.get('USERPOOL_ID')

jwks_url=f'https://cognito-idp.{region}.amazonaws.com/{user_pool_id}/.well-known/jwks.json'


def handler(event, context):
    with urllib.request.urlopen(jwks_url) as response:
        data = response.read()

    return data
