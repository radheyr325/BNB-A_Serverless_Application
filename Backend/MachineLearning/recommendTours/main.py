from google.cloud import bigquery
import json

#Creates a table in big query, inserts the provided duration, 
#queries a machine learning model, and responds with the results
def hello_world(request):

    request_json = request.get_json()
    duration = request_json["duration"]

    client = bigquery.Client()
    query = """
        CREATE or replace TABLE `tour.predict` (`duration` INT64);
        INSERT INTO `tour.predict` VALUES({0});
        SELECT `predicted_id_probs` from ML.PREDICT (MODEL `serverless-355702.tour.tourmodel2`,
        (SELECT *  from `tour.predict` ))
    """.format(int(duration))

    job = client.query(query)
    result = job.result()
 
    response = []
    for row in result:
        response.append(row[0])
    return json.dumps(response[0]);
