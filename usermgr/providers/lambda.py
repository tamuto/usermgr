import boto3
import json

from ..base import UserManager


def new_instance(**kwargs):
    return LambdaUserMgr(**kwargs)


class LambdaUserMgr(UserManager):

    def __init__(self, **kwargs):
        self.client = boto3.client('lambda')

    def close(self):
        pass

    def _invoke(self, payload):
        result = self.client.invoke(
            FunctionName='usermgr',
            LogType='Tail',
            Payload=json.dumps(payload).encode('utf-8')
        )
        # print(base64.b64decode(result['LogResult']).decode())
        return json.loads(result['Payload'].read().decode('utf-8'))

    def add_user(self, username, password, attrs):
        return self._invoke({
            'type': 'add_user',
            'username': username,
            'password': password,
            'attrs': attrs
        })

    def update_user(self, username, attrs):
        return self._invoke({
            'type': 'update_user',
            'username': username,
            'attrs': attrs
        })

    def set_password(self, username, password, permanent=False):
        return self._invoke({
            'type': 'set_password',
            'username': username,
            'password': password,
            'permanent': permanent
        })

    def delete_user(self, username):
        return self._invoke({
            'type': 'delete_user',
            'username': username
        })

    def is_exist_user(self, username):
        return self._invoke({
            'type': 'is_exist_user',
            'username': username
        })

    def add_user_to_group(self, username, groupname):
        return self._invoke({
            'type': 'add_user_to_group',
            'username': username,
            'groupname': groupname
        })

    def add_group(self, groupname, description=''):
        return self._invoke({
            'type': 'add_group',
            'groupname': groupname,
            'description': description
        })

    def delete_group(self, groupname):
        return self._invoke({
            'type': 'delete_group',
            'groupname': groupname
        })
