import json
import math
import dateutil.parser
import datetime
import time
import os
import logging
import boto3
import requests
import urllib.parse
from opensearchpy import OpenSearch, RequestsHttpConnection
    
logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

headers = { "Content-Type": "application/json" }
host = 'search-photo-v4443ixeyns4cfuyhzy5x3dieu.us-east-1.es.amazonaws.com'
region = 'us-east-1'
lex = boto3.client('lex-runtime', region_name=region)

#Setting values to be referenced later in the program
username = "master_user"
password = "Suits1998*"

def lambda_handler(event, context):
    q1 = event["queryStringParameters"]['q']
    labels = get_labels(q1)
    if len(labels) != 0:
        img_paths = get_photo_path(labels)

    if not img_paths:
        return{
            'statusCode':404,
            "headers":{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"*","Access-Control-Allow-Headers": "*"},
            'body': json.dumps('No Results found')
        }
    else:    
        return{
            'statusCode':200,
            "headers":{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"*","Access-Control-Allow-Headers": "*"},
            'body': json.dumps(img_paths)
        }
    
def get_labels(query):
    response = lex.post_text(
        botName='PhotoSearchBot',                 
        botAlias='PhotoSearchBot',
        userId="abhinav",           
        inputText=query
    )
    
    labels = []
    if 'slots' not in response:
        print("No photo collection for query {}".format(query))
    else:
        print ("slot: ",response['slots'])
        slot_val = response['slots']
        for key,value in slot_val.items():
            if value!=None:
                labels.append(value)
    return labels

    
def get_photo_path(keys):
    os = OpenSearch(
        hosts = [{'host': host, 'port': 443}],
        http_auth = (username, password),
        use_ssl = True,
        verify_certs = True,
        connection_class = RequestsHttpConnection
    )
    
    resp = []
    for key in keys:
        if (key is not None) and key != '':
            searchData = os.search({"query": {"match": {"labels": key}}})
            resp.append(searchData)
    
    output = []
    for r in resp:
        if 'hits' in r:
             for val in r['hits']['hits']:
                key = val['_source']['objectKey']
                if key not in output:
                    output.append('https://photosalbumb2.s3.amazonaws.com/'+key)
    
    return output
