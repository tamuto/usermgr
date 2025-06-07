import os


class Factory:
    AWS_COGNITO = 'AWS_COGNITO'
    AWS_LAMBDA = 'AWS_LAMBDA'

    _instances = {}

    @classmethod
    def create(cls, provider_type: str, **kwargs):
        """Create a new instance of the specified provider type.

        Args:
            provider_type: The type of provider (AWS_COGNITO or AWS_LAMBDA)
            **kwargs: Arguments to pass to the provider constructor

        Returns:
            A new instance of the requested provider

        Note:
            This method creates a new instance each time it's called.
            For singleton behavior, use get_instance() or get_usermgr().
        """
        if provider_type == cls.AWS_COGNITO:
            from usermgr.providers.cognito import CognitoUserMgr
            return CognitoUserMgr(**kwargs)
        elif provider_type == cls.AWS_LAMBDA:
            from usermgr.providers.lambda_ import LambdaUserMgr
            return LambdaUserMgr(**kwargs)
        else:
            raise ValueError(f"Unknown provider type: {provider_type}")

    @classmethod
    def get_instance(cls, provider_type: str, **kwargs):
        """Get an instance of the specified provider type.

        Args:
            provider_type: The type of provider (AWS_COGNITO or AWS_LAMBDA)
            **kwargs: Arguments to pass to the provider constructor

        Returns:
            An instance of the requested provider
        """
        if provider_type == cls.AWS_COGNITO:
            from usermgr.providers.cognito import CognitoUserMgr
            return CognitoUserMgr(**kwargs)
        elif provider_type == cls.AWS_LAMBDA:
            from usermgr.providers.lambda_ import LambdaUserMgr
            return LambdaUserMgr(**kwargs)
        else:
            raise ValueError(f"Unknown provider type: {provider_type}")

    @classmethod
    def get_usermgr(cls):
        """Get a singleton instance based on environment variables.

        Returns:
            A UserManager instance based on environment configuration
        """
        if os.getenv('AWS_COGNITO'):
            provider_type = cls.AWS_COGNITO
            key = 'cognito_default'
            if key not in cls._instances:
                cls._instances[key] = cls.get_instance(
                    provider_type,
                    region=os.getenv('AWS_REGION'),
                    user_pool_id=os.getenv('USERPOOL_ID'),
                    client_id=os.getenv('CLIENT_ID'),
                    client_secret=os.getenv('SECRET')
                )
            return cls._instances[key]
        elif os.getenv('AWS_LAMBDA'):
            provider_type = cls.AWS_LAMBDA
            key = 'lambda_default'
            if key not in cls._instances:
                cls._instances[key] = cls.get_instance(
                    provider_type,
                    function_name=os.getenv('LAMBDA_FUNCTION_NAME', 'usermgr')
                )
            return cls._instances[key]
        else:
            raise ValueError(
                "No provider configuration found. Set either AWS_COGNITO or AWS_LAMBDA environment variable."
            )


# Legacy compatibility
AWS_COGNITO = Factory.AWS_COGNITO
AWS_LAMBDA = Factory.AWS_LAMBDA
singleton = None


def get_instance(provider, **kwargs):
    """Legacy function for backward compatibility"""
    global singleton
    if singleton is not None:
        return singleton

    # Map legacy provider names to new format
    if provider == 'cognito':
        provider_type = Factory.AWS_COGNITO
    elif provider == 'lambda':
        provider_type = Factory.AWS_LAMBDA
    else:
        raise ValueError(f"Unknown provider: {provider}")

    singleton = Factory.get_instance(provider_type, **kwargs)
    return singleton
