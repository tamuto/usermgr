import os
import boto3
import datetime

dbname = os.getenv('DYNAMODB_NAME')


def handler(event, context):
    db = boto3.resource('dynamodb')
    tbl = db.Table(dbname)
    jst = datetime.timezone(datetime.timedelta(hours=+9), 'JST')
    tbl.put_item(
        Item={
            'user_id': event['request']['userAttributes']['sub'],
            'user_name': event['userName'],
            'updated_at': datetime.datetime.now(jst).isoformat(),
        }
    )
    event['response'] = {
        'claimsOverrideDetails': {
            'claimsToAddOrOverride': {
                'custom:updated_at': datetime.datetime.now(jst).isoformat(),
            }
        }
    }
    return event
