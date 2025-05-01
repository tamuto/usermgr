from abc import ABCMeta
from abc import abstractmethod


class UserManager(metaclass=ABCMeta):

    @abstractmethod
    def close(self):
        raise NotImplementedError()

    @abstractmethod
    def add_user(self, username, password, attrs):
        raise NotImplementedError()

    @abstractmethod
    def update_user(self, username, attrs):
        raise NotImplementedError()

    @abstractmethod
    def set_password(self, username, password, permanent=False):
        raise NotImplementedError()

    @abstractmethod
    def delete_user(self, username):
        raise NotImplementedError()

    @abstractmethod
    def is_exist_user(self, username):
        raise NotImplementedError()

    @abstractmethod
    def add_user_to_group(self, username, groupname):
        raise NotImplementedError()

    @abstractmethod
    def add_group(self, groupname):
        raise NotImplementedError()

    @abstractmethod
    def delete_group(self, groupname):
        raise NotImplementedError()
