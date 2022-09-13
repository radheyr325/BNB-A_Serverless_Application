import json
import boto3
import uuid
import requests
import decimal

#https://www.gcptutorials.com/article/how-to-use-requests-module-in-aws-lambda
def lambda_handler(event, context):
  if event['context']['resource-path'] == '/booktour':
    response = booktour(event,context)
    return response
  if event['context']['resource-path'] == '/reviewtour':
    response = reviewtour(event,context)
    return response
  elif event['context']['resource-path'] == '/gettours':
    response = gettours(event,context)
    return response

#function for booking a tour
def booktour(event, context):
  dynamodb = boto3.resource('dynamodb')
  id = uuid.uuid4()
  id = str(id)
  
  #validate request body
  try: 
    groupSize = event['body-json']['groupSize']
    if int(groupSize) < 0:
      return {
      "message":"groupSize must be a positive integer"
    }
  except: 
    return {
      "message":"please include a valid number for groupSize when booking"
    }
  try: 
    tourId = event['body-json']['tourId']
  except: 
    return {
      "message":"please include tourId when booking"
    }
  try: 
    email = event['body-json']['email']
  except:
    return {
      "message":"please include email for user when booking"
    }
    
  tours = dynamodb.Table('tours')
  tour = tours.get_item(Key={"id":tourId})
  
  try:
    item = tour["Item"]
  except:
    return {
      "error":"please include a valid tourId"
    }
    
  #validate group size
  min = tour["Item"]["min"]
  max = tour["Item"]["max"]
  
  if int(groupSize) < min or int(groupSize) > max:
    return {
      "message":"The selected tour only allows group sizes between "+str(min)+" and "+str(max)
    }
  
  orders = dynamodb.Table('tourOrders')
  response = orders.put_item(
    Item = {
      'id' : id,
      'email' : email,
      'groupSize' : groupSize,
      'tourId' : tourId
    }
  )

  return {
    "message":"tour booked."
  }
  
#Function for retrieving tours
#If groupSize is included in params, the result is filtered for tours with the required capacity
#If duration is included in params, the result is filtered for only recommended tours for that duration
def gettours(event, context):
  params = event['params']['querystring']
  dynamodb = boto3.client("dynamodb")
  dynamodb = boto3.resource('dynamodb', region_name="us-east-1")
  table = dynamodb.Table("tours")
  response = table.scan()
  items = response["Items"] 
  
  if "groupSize" in params:
    try:
      groupSize = int(params["groupSize"])
      if groupSize < 0:
        return {
          "message":"groupSize must be positive."
        }
    except: 
      return {
        "message":"groupSize must be an integer."
      }
    filtered = filter(lambda item: filterByGroupSize(groupSize,item), items)
    items = list(filtered)
  if "duration" in params:
    try:
      duration = int(params["duration"])
      if duration < 0:
        return {
          "message":"duration must be positive."
        }
    except: 
      return {
        "message":"duration must be an integer."
      }
    #post to ml module
    body = {
      "duration": duration
    }
    response = requests.post('https://us-east1-serverless-355702.cloudfunctions.net/toursApiFunction/recommendtour', json = body)
    tours = response.json()["tours"];
    filtered = filter(lambda item: filterById(tours,item), items)
    items = list(filtered)
 
  return items

#Function for fitering tours by groupSize
def filterByGroupSize(groupSize, item):
  return groupSize >= int(item['min']) and  groupSize <= int(item['max'])
 
#Function for fitering tours by recommended tours 
def filterById(tours, item):
  return item["id"] in tours

#Function for submitting a tour review or rating
#If review is included in the body, it is sent to a GCP cloud function for sentiment analysis
#If rating is included in the body, it is used to update the current rating for the tour in DynamoDB
def reviewtour(event, context):
  #validate request body
  if "id" not in event['body-json']:
    return {
      "message":"please include an id field with a tour id."
    }
    
  id = event['body-json']['id']
  dynamodb = boto3.client("dynamodb")
  dynamodb = boto3.resource('dynamodb', region_name="us-east-1")
  table = dynamodb.Table("tours")
  tour = table.get_item(Key={"id":id})
  if "Item" not in tour:
    return {
      "message": "not a valid tour id"
    }
      
  if "review" in event["body-json"]:
    review = event['body-json']['review']
    #post to ml module
    body = {
      "id": id,
      "review": review
    }
    response = requests.post('https://us-east1-serverless-355702.cloudfunctions.net/toursApiFunction/reviewtour', json = body)
    return {
      "statusCode" : "200",
      "message":"review received."
    }
  elif "rating" in event["body-json"]:
    try:
      rating = decimal.Decimal(event['body-json']['rating'])
    except:
      return {
        "message" : "rating must be a number"
      }
   
    #get current rating and number of reviews
    count = tour["Item"]["reviewCount"]
    oldRating = tour["Item"]["rating"]
    
    #calculate new average rating
    newRating = (rating + (oldRating*count))/(count+1)
    newRating = round(newRating,2)
    #update rating and review count
    table.update_item(
      Key={
        'id': id
      },
      UpdateExpression = 'SET rating = :newRating, reviewCount = :newCount',
      ExpressionAttributeValues = {
        ':newRating': newRating,
        ':newCount' : (count+1)
      }
    )
    return {
      "statusCode" : "200",
      "message":"tour rating updated."
    }
  return {
      "message":"No review or rating was sent in the request."
  }