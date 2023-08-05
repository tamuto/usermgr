import os
import boto3
import hmac
import hashlib
import base64

from botocore.exceptions import ClientError

user_pool_id = os.environ.get('USERPOOL_ID')
client_id = os.environ.get('CLIENT_ID')
secret = os.environ.get('SECRET')

idp = boto3.client('cognito-idp')


def handler(event, context):

    event_type = event['type']

    if event_type == 'add_user':
        return add_user(
            event['username'],
            event['password'],
            event['attrs']
        )
    if event_type == 'update_user':
        return update_user(
            event['username'],
            event['attrs']
        )
    if event_type == 'set_password':
        return set_password(
            event['username'],
            event['password'],
            event['permanent']
        )
    if event_type == 'delete_user':
        return delete_user(
            event['username']
        )
    if event_type == 'is_exist_user':
        return is_exist_user(
            event['username']
        )
    if event_type == 'add_user_to_group':
        return add_user_to_group(
            event['username'],
            event['groupname']
        )
    if event_type == 'add_group':
        return add_group(
            event['groupname'],
            event['description']
        )
    if event_type == 'delete_group':
        return delete_group(
            event['groupname']
        )
    raise RuntimeError(f'Unknown Event Type: {event_type}')


def _make_hash(username):
    return base64.b64encode(hmac.new(
        bytes(secret, 'utf-8'),
        bytes(username + client_id, 'utf-8'),
        digestmod=hashlib.sha256).digest()).decode()


def add_user(username, password, attrs):
    response = idp.admin_create_user(
        UserPoolId=user_pool_id,
        Username=username,
        TemporaryPassword=password,
        UserAttributes=[{"Name": k, "Value": v} for k, v in attrs.items()],
        MessageAction="SUPPRESS"
    )
    sub_id = [d['Value'] for d in response['User']['Attributes'] if d['Name'] == 'sub'][0]

    response = idp.admin_initiate_auth(
        UserPoolId=user_pool_id,
        ClientId=client_id,
        AuthFlow='ADMIN_NO_SRP_AUTH',
        AuthParameters={
            'USERNAME': username,
            'PASSWORD': password,
            'SECRET_HASH': _make_hash(username)
        }
    )

    session = response['Session']

    response = idp.admin_respond_to_auth_challenge(
        UserPoolId=user_pool_id,
        ClientId=client_id,
        ChallengeName='NEW_PASSWORD_REQUIRED',
        ChallengeResponses={
            'USERNAME': username,
            'NEW_PASSWORD': password,
            'SECRET_HASH': _make_hash(username)
        },
        Session=session
    )
    return sub_id


def update_user(username, attrs):
    idp.admin_update_user_attributes(
        UserPoolId=user_pool_id,
        Username=username,
        UserAttributes=[{"Name": k, "Value": v} for k, v in attrs.items()],
    )


def set_password(username, password, permanent=False):
    idp.admin_set_user_password(
        UserPoolId=user_pool_id,
        Username=username,
        Password=password,
        Permanent=permanent
    )


def delete_user(username):
    idp.admin_delete_user(
        UserPoolId=user_pool_id,
        Username=username
    )


def is_exist_user(username):
    try:
        idp.admin_get_user(
            UserPoolId=user_pool_id,
            Username=username
        )
        return True
    except ClientError as e:
        if e.response['Error']['Code'] == 'UserNotFoundException':
            return False
        raise


def add_user_to_group(username, groupname):
    idp.admin_add_user_to_group(
        UserPoolId=user_pool_id,
        Username=username,
        GroupName=groupname
    )


def add_group(groupname, description=''):
    idp.create_group(
        UserPoolId=user_pool_id,
        GroupName=groupname,
        Description=description
    )


def delete_group(groupname):
    idp.delete_group(
        UserPoolId=user_pool_id,
        GroupName=groupname
    )
