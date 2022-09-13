from google.cloud import firestore

def hello_world(request):
    if(request.method == 'OPTIONS'):
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }
        return('', 204, headers)

    headers = {
        'Access-Control-Allow-Origin': '*'
    }
        
    try:
        data = request.get_json()
        client = firestore.Client()
        addDoc = client.collection(u'userLog').document().set(data)
        print(addDoc)
        return ("success",200,headers)
    except Exception as e:
        print(e)
        return ("failed",200,headers)
