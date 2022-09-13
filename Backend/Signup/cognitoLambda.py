import json
import boto3
from boto3.dynamodb.conditions import Key


def lambda_handler(event, context):
    if event['context']['resource-path'] == '/register':
        response = register(event, context)
        return response
    elif event['context']['resource-path'] == '/verifyqa':
        response = verifyqa(event, context)
        return response


def register(event, context):
    ''' Sign up user '''
    ''' author: @gamdha (Vasu Gamdha) '''
    print("Event:", event)
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('BNBUserSecurityQA')
    try:
        response = table.put_item(
            Item={
                'uuid': event['body-json']['uuid'],
                'email': event['body-json']['email'],
                'q1': event['body-json']['q1'],
                'q2': event['body-json']['q2'],
                'q3': event['body-json']['q3'],
            }
        )
    except Exception as e:
        return {
            "statusCode": "403",
            "message": "Failed."
        }
    return {
        "statusCode": "200",
        "message": "Security QA stored."
    }


def verifyqa(event, context):
    ''' Verify user security QA '''
    ''' author: @gamdha (Vasu Gamdha) '''
    print("Event:", event)
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('BNBUserSecurityQA')
    email = (event['body-json']['email'])
    q1q = (event['body-json']['q1'])
    q2q = (event['body-json']['q2'])
    q3q = (event['body-json']['q3'])

    response = table.get_item(
        Key={
            "email": email
        }
    )

    item = response["Item"]
    q1a = item['q1']
    q2a = item['q2']
    q3a = item['q3']
    print(q1q)
    print(q1a)
    print(q2a)
    print(q3a)

    if(q1q == q1a) and (q2q == q2a) and (q3q == q3a):
        res = True
    else:
        res = False
    print("This is result => ")
    print(res)
    return res
