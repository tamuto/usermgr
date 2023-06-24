# User Management API

## Memo

* unittest

  * prepare .env file

```
AWS_ACCESS_KEY_ID=***
AWS_SECRET_ACCESS_KEY=***
or
AWS_PROFILE=***

USER_POOL_ID=***
CLIENT_ID=***
CLIENT_SECRET=***
```

  * run unittest

```
poetry run dotenv run python -m unittest discover
```

* build

```
poetry build
```

* public

```
poetry publish
```

* Install for development

```
poetry install -E cognito
```
