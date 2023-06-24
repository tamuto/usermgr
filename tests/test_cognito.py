import unittest
import os

from usermgr import Factory


class TestCognito(unittest.TestCase):

    def setUp(self):
        if Factory.singleton != None:
            Factory.singleton.close()
        Factory.singleton = None

        user_pool_id = os.environ.get('USER_POOL_ID')
        client_id = os.environ.get('CLIENT_ID')
        client_secret = os.environ.get('CLIENT_SECRET')
        self.mgr = Factory.get_instance(
            Factory.AWS_COGNITO,
            user_pool_id=user_pool_id,
            client_id=client_id,
            client_secret=client_secret
        )

    def tearDown(self):
        if Factory.singleton != None:
            Factory.singleton.close()
        Factory.singleton = None

    def test_user(self):
        if self.mgr.is_exist_user('test'):
            self.mgr.delete_user('test')
        attrs = {
            'email': 'test@infodb.jp',
            'email_verified': 'true',
            'custom:facility_code': 'abc123'
        }
        self.mgr.add_user('test', 'labo$test%123', attrs)
        self.mgr.add_user_to_group('test', 'testgroup')

        attrs['custom:facility_code'] = 'updated'
        self.mgr.update_user('test', attrs)

        self.mgr.set_password('test', 'labo$test%456', True)

    def test_add_group(self):
        # self.mgr.delete_group('testgroup')
        # self.mgr.add_group('testgroup', 'test description')
        # 連続で動かないため、一旦作成した状態で止めている。
        pass
