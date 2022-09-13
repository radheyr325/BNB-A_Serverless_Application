'''
    author: @gamdha (Vasu Gamdha)
'''
import simplejson as json
import boto3
from boto3.dynamodb.conditions import Key, Attr
import datetime

def lambda_handler(event, context):
    if event['context']['resource-path'] == '/bookroom':
        response = bookRoom(event,context)
        return response
    elif event['context']['resource-path'] == '/getbookedrooms':
        response = getBookedRooms(event,context)
        return response
    elif event['context']['resource-path'] == '/checkavailability':
        response = checkAvailability(event,context)
        return response
        
def checkAvailability(event, context):
    ''' checks if room is available for booking '''
    dynamodb = boto3.resource('dynamodb')
    roomsTable = dynamodb.Table('rooms')
    response = roomsTable.scan(
        FilterExpression=Attr('count').gt(0) 
    )
    
    return {
        'statusCode': 200,
        'body': response['Items']
    }
    
        
def bookRoom(event, context):
    ''' book room for user '''
    print("Event:",event)
    # orderId, email, people, checkin, checkout, roomId
    try:
        dynamodb = boto3.resource('dynamodb')
        ordersTable = dynamodb.Table('roomOrders')
        roomsTable = dynamodb.Table('rooms')
        d1 = datetime.datetime.strptime(event['body-json']['checkin'], "%Y-%m-%d")
        d2 = datetime.datetime.strptime(event['body-json']['checkout'], "%Y-%m-%d")
    
        nights = max ((d2-d1).days, 0)
        
        price = roomsTable.get_item(
        Key={
            "roomId": event['body-json']['roomId']
        }
        )
        roomprice = price['Item']['price']
        
        bill = int(event['body-json']['people']) * int(roomprice) * int(nights)
        
        response = ordersTable.put_item(
            Item={
                "orderId": event['body-json']['orderId'],
                "email": event['body-json']['email'],
                "people": event['body-json']['people'],
                "checkin": event['body-json']['checkin'],
                "checkout": event['body-json']['checkout'],
                "roomId": event['body-json']['roomId'],
                "bill": bill,
                "date": datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S") 
            }
        )
        
        roomsTable = dynamodb.Table('rooms')
    
        if response['ResponseMetadata']['HTTPStatusCode'] == 200:
            updated_count = max(0, roomsTable.get_item(Key={'roomId': event['body-json']['roomId']})['Item']['count'] - 1)
            
            response = roomsTable.update_item(
                Key={
                    "roomId": event['body-json']['roomId']
                },
                UpdateExpression="SET #cc = :val",
                ExpressionAttributeValues={
                    ":val": updated_count
                },
                ExpressionAttributeNames={
                    "#cc": "count"
                },
                ReturnValues="UPDATED_NEW"
            )   
            
            if response['ResponseMetadata']['HTTPStatusCode'] == 200:
                return {
                    "statusCode": 200,
                    "success": True,
                    "price": bill,
                    "message": "Room booked."
                }
            else:
                return {
                    "statusCode": 400,
                    "success": False,
                    "message": "Couldn't book the requested room!"
                }
        else:
            return {
                "statusCode": 200,
                "success": False,
                "message": "Couldn't book the requested room!"
            }
    except Exception as e:
        return {
            "statusCode": 200,
            "success": False,
            "message": "Couldn't book the requested room!"
        }
        

  
def getBookedRooms(event, context):
    ''' gets all room booking orders by email or orderId '''
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('roomOrders')
    if 'email' in event['params']['querystring']:
        response = table.scan(
            FilterExpression=Attr('email').eq(event['params']['querystring']['email'])
        )
    elif 'orderId' in event['params']['querystring']:
        response = table.scan(
            FilterExpression=Attr('orderId').eq(event['params']['querystring']['orderId'])
        )
    else:
        return {
            "statusCode" : "400",
            "body" : "Bad request"
        }
    return {
        'statusCode': 200,
        'body': response['Items']
    }