'''
    author: Ali Shan Khawaja
'''

import json
import boto3

def lambda_handler(event, context):
  if event['context']['resource-path'] == '/getitem':
    response = getItem(event,context)
    return response
  elif event['context']['resource-path'] == '/submitorder':
    response = submitOrder(event,context)
    return response
  elif event['context']['resource-path'] == '/fetchmenu':
    response = fetchMenuItems(event,context)
    return response
    
def getItem(event, context):
  print("Event:",event)
  
  dynamodb = boto3.client("dynamodb")
  dynamodb = boto3.resource('dynamodb', region_name="us-east-1")
  table = dynamodb.Table("menuItems")
  response = table.get_item(Key={'id': event['body-json']['id']})
  print(response)
  return response 
  
def submitOrder(event, context):
  print("Event:",event)
  dynamodb = boto3.client("dynamodb")
  dynamodb = boto3.resource('dynamodb', region_name="us-east-1")
  table = dynamodb.Table('kitchenOrders')
  priceVar = event['body-json']['price'];
  print(type(priceVar))
  print({'email' : event['body-json']['email'],'id' : event['body-json']['id'],'cuisine' : event['body-json']['cuisine'],'foodItem' : event['body-json']['foodItem'], 'foodName' : event['body-json']['foodName'],'price' : event['body-json']['price']})
  response = table.put_item(Item={'email' : event['body-json']['email'],'id' : event['body-json']['id'],'cuisine' : event['body-json']['cuisine'],'foodItem' : event['body-json']['foodItem'], 'foodName' : event['body-json']['foodName'],'price' : "{:.2f}".format(event['body-json']['price'])})
  print("Hello")
  return response 
  
def fetchMenuItems(event, context):
  print("Event:",event)
  
  dynamodb = boto3.client("dynamodb")
  dynamodb = boto3.resource('dynamodb', region_name="us-east-1")
  table = dynamodb.Table("menuItems")
  response = table.scan()
  print(response)
  return response 
  