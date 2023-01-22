from .cognito import CognitoUserMgr

AWS_COGNITO = 'cognito-idp'


def get_instance(provider, **kwargs):
    if provider == AWS_COGNITO:
        return CognitoUserMgr(**kwargs)
    raise Exception(f'Unknown Provider: {provider}')
