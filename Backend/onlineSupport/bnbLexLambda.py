'''
    author: Ali Shan Khawaja
'''

import json
import boto3
import uuid
import requests


def lambda_handler(event, context):
    print(event)
    intent = event["currentIntent"]["name"]
    email = event["sessionAttributes"]["email"]
    intent = intent.lower()
    if email != "":
        if intent == "orderfood":
            response = food_intent_handler(event, context)
        elif intent == "booktour":
            response = tour_intent_handler(event, context)
        elif intent == "bookroom":
            response = room_intent_handler(event, context)
        else:
            response = {"dialogAction": {
                "type": "Close",
                "fulfillmentState": "Failed",
                "message": {
                    "contentType": "PlainText",
                    "content": "Intent Not Found"
                }
            }

            }
    else:
        response = {"dialogAction": {
                "type": "Close",
                "fulfillmentState": "Failed",
                "message": {
                    "contentType": "PlainText",
                    "content": "Please Login First"
                }
            }

            }
    return response


def food_intent_handler(event, context):
    Food_Item = event["currentIntent"]["slots"]["Food_Item"]
    Food_Item = str(Food_Item).lower()
    fulfillmentState = ""
    content = ""
    cost = 0
    type = ""
    dynamodb = boto3.client("dynamodb")
    dynamodb = boto3.resource('dynamodb', region_name="us-east-1")
    table = dynamodb.Table("menuItems")
    response = table.scan()
    # print(response)
    insertFlag = False
    for item in response["Items"]:
        print(item)

        if item["name"].lower() == Food_Item:
            myuuid = uuid.uuid4()
            recordInsert = {
                'id': str(myuuid),
                'email': event["sessionAttributes"]["email"],
                'cuisine': item["cuisine"],
                'foodItem': item["id"],
                'foodName': item["name"],
                'price': "{:.2f}".format(item["price"])}
            print(recordInsert)
            table = dynamodb.Table("kitchenOrders")
            response = table.put_item(Item=recordInsert)
            fulfillmentState = "Fulfilled"
            content = "Order Placed for " + Food_Item + " with a total cost of " + str(item["price"]) + " CAD."
            insertFlag = True
    if insertFlag == False:
        fulfillmentState = "Failed"
        content = Food_Item + " of this name does not exists please select again."

    res = {
        "dialogAction": {
            "type": "Close",
            "fulfillmentState": fulfillmentState,
            "message": {
                "contentType": "PlainText",
                "content": content
            }
        }

    }
    print(res)

    return res


def room_intent_handler(event, context):
    checkIn = event["currentIntent"]["slots"]["checkIn"]
    checkOut = event["currentIntent"]["slots"]["checkOut"]
    occupants = event["currentIntent"]["slots"]["occupants"]
    Room_Type = event["currentIntent"]["slots"]["Room_Type"]
    dynamodb = boto3.client("dynamodb")
    dynamodb = boto3.resource('dynamodb', region_name="us-east-1")
    table = dynamodb.Table("rooms")
    response = table.scan()
    insertFlag = False
    for item in response["Items"]:
        if item["type"].lower() == Room_Type.lower():
            myuuid = uuid.uuid4()
            recordInsert = {'orderId': str(myuuid), 'email': event["sessionAttributes"]["email"], 'people': occupants,'checkin':checkIn ,'checkout':checkOut,'roomId':item["roomId"] }
            recordInsert = json.dumps(recordInsert)
            print(recordInsert)
            insertFlag = True
    if insertFlag == True:
        response = requests.post('https://3zg49m9lti.execute-api.us-east-1.amazonaws.com/test/bookroom', data=recordInsert)
        response = json.loads(response.text)
        print(response)
        fulfillmentState = "Fulfilled"
        content = response["message"]
    else:
        fulfillmentState = "Failed"
        content = "Order failed"
    res = {"dialogAction": {"type": "Close", "fulfillmentState": fulfillmentState,
                            "message": {"contentType": "PlainText", "content": content}}}
    print(res)
    return res


def tour_intent_handler(event, context):
    Tour_Type = event["currentIntent"]["slots"]["Tour_Type"]
    travellers = event["currentIntent"]["slots"]["travellers"]
    dynamodb = boto3.client("dynamodb")
    dynamodb = boto3.resource('dynamodb', region_name="us-east-1")
    table = dynamodb.Table("tours")
    response = table.scan()
    insertFlag = False
    for item in response["Items"]:
        if item["name"].lower() == Tour_Type.lower():
            myuuid = uuid.uuid4()
            recordInsert = {'tourId': item["id"], 'email': event["sessionAttributes"]["email"], 'groupSize': int(travellers)}
            recordInsert = json.dumps(recordInsert)
            print(recordInsert)
            insertFlag = True
    if insertFlag == True:
        response = requests.post('https://3zg49m9lti.execute-api.us-east-1.amazonaws.com/test/booktour', data=recordInsert)
        
        fulfillmentState = "Fulfilled"
        response = json.loads(response.text)
        print(response)
        content = response["message"]
    else:
        fulfillmentState = "Failed"
        content = "Order failed"
    res = {"dialogAction": {"type": "Close", "fulfillmentState": fulfillmentState,
                            "message": {"contentType": "PlainText", "content": content}}}
    print(res)
    return res
