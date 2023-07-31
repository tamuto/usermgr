import unittest
import os

from usermgr import Factory


class TestFactory(unittest.TestCase):

    def setUp(self):
        if Factory.singleton != None:
            Factory.singleton.close()
        Factory.singleton = None

    def test_get_instance_except(self):
        with self.assertRaises(ModuleNotFoundError):
            instance = Factory.get_instance('UnkownProvider')

    def test_get_instance_cognito(self):
        region = os.environ.get('REGION')
        user_pool_id = os.environ.get('USER_POOL_ID')
        client_id = os.environ.get('CLIENT_ID')
        client_secret = os.environ.get('CLIENT_SECRET')
        instance = Factory.get_instance(
            Factory.AWS_COGNITO,
            region=region,
            user_pool_id=user_pool_id,
            client_id=client_id,
            client_secret=client_secret)
        self.assertEqual(instance.__class__.__name__, 'CognitoUserMgr')
