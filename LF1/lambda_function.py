

import json
import os
import time
import logging
import boto3
import requests
from datetime import datetime
from opensearchpy import OpenSearch, RequestsHttpConnection

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)


# credentials = boto3.Session().get_credentials()
# awsauth = AWS4Auth(credentials.access_key, credentials.secret_key, region, service, session_token=credentials.token)
headers = { "Content-Type": "application/json" }
host = 'search-photo-v4443ixeyns4cfuyhzy5x3dieu.us-east-1.es.amazonaws.com'
region = 'us-east-1'
username = "master_user"
password = "Suits1998*"
port = 443
ssl = True
certs = True
service = "es"
os = OpenSearch(
        hosts=[{'host': host,'port': port}], 
        http_auth=(username, password), 
        use_ssl = ssl, 
        verify_certs=certs, 
        connection_class=RequestsHttpConnection
    )
def rekognition_function(bucket_name, file_name):
    
    #adding comment in function
    print("Inside function")
    print(bucket_name)
    print(file_name)
    client = boto3.client('rekognition')
    response = client.detect_labels(
        Image={
            'S3Object':{
                'Bucket':bucket_name, 
                'Name': file_name
            }
        }, 
        MaxLabels=10 
    )
    label_names = []

    label_names = list(map(lambda x:x['Name'], response['Labels']))
    label_names = [x.lower() for x in label_names]
    print("label namesssssss", label_names)
    return label_names
def lambda_handler(event, context):
    # TODO implement
    s3 = boto3.client('s3')
    record = event['Records'][0]
    
    print("event : ", event)
    s3Object = record['s3']
    bucket = s3Object['bucket']['name']
    file_name = s3Object['object']['key']
    key = s3Object['object']['key']
    response = s3.head_object(Bucket=bucket, Key=key)
    print("head_object : " , response)
    if response["Metadata"]:
        customlabels = response["Metadata"]["customlabels"]
        print("customlabels : ", customlabels)
        customlabels = customlabels.split(',')
        customlabels = list(map(lambda x: x.lower(), customlabels))
    time_stamp = record['eventTime']
    print("Timestamp is :")
    print(time_stamp)
    label_names = rekognition_function(bucket, file_name)
    if response["Metadata"]:
        for cl in customlabels:
            print(cl)
            cl = cl.lower().strip()
            if cl not in label_names:
                label_names.append(cl)

    print(label_names)
    json_object = {
        'objectKey': s3Object['object']['key'],
        'bucket': bucket,
        'createdTimestamp': time_stamp,
        'labels': label_names
    }
    os.index(index = "photo", id = key, body = json_object, refresh = True)
    return {
        'statusCode': 200,
        'body': json.dumps('Indexing Successfully done!!')
    }
