import unittest

from usermgr import Factory


class TestFactory(unittest.TestCase):

    def test_get_instance_except(self):
        with self.assertRaises(Exception):
            Factory.get_instance('UnkownProvider')

    def test_get_instance_cognito(self):
        instance = Factory.get_instance(Factory.AWS_COGNITO)
        self.assertEqual(instance.__class__.__name__, 'CognitoUserMgr')
