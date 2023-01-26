# User Management API

## Memo

* unittest

  * prepare .env file

```
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
or
AWS_PROFILE=xxx

USER_POOL_ID=xxx
CLIENT_ID=xxx
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
