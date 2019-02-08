from websocket import create_connection
import ssl
import requests

url = 'http://localhost:8000/api-token-auth/'
data = {"username":"collector","password":"Coll2018"}
r = requests.post(url, json=data)
token = r.json()['token']

url = 'http://localhost:8000/api/events'
typtag = 'unr_soc'
d = '{"category": "unknown", "sip": "23.50.32.116", "severity": "low", "time": "2018/12/05 14:01:32", "type": "file", "description": "DER Encoded X509 Certificate"}'
data = d.encode()
headers={'Authorization': 'JWT '+token}
files = {'file': data}
r = requests.post(url, files=files, headers = headers, data = {'typtag':typtag})
