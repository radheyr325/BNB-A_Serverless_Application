'''
    author: @gamdha (Vasu Gamdha)
'''
import json

def lambda_handler(event, context):
    ''' To auto verify user email'''
    event['response']['autoConfirmUser'] = True
    event['response']['autoVerifyEmail'] = True; 
    return event
    
