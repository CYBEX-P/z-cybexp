from websocket import create_connection
import ssl
import json
import requests
import time
import threading
import pdb
import logging

# Configure Logging
logger = logging.getLogger('coll')
hdlr = logging.FileHandler('coll.log')
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
logger.addHandler(hdlr) 
logger.setLevel(logging.WARNING)

class my_thread(threading.Thread):
    def __init__(self, threadID, name, counter):
        threading.Thread.__init__(self)
        self.threadID = threadID
        self.name = name
        self.counter = counter

token = '0'
class get_token(my_thread):
    AUTH_SRV = 'http://localhost:8000/api-token-auth/'
     
    def run(self, url=AUTH_SRV):
        global token
        data = {"username":"collector","password":"Coll2018"}
        while True:
            try:
                r = requests.post(url, json=data)
                token = r.json()['token']
            except:
                logger.exception("message")
            time.sleep(295)
##                time.sleep(295)

class get_event(my_thread):
    API_SRV = 'http://localhost:8000/api/events'
    
    def __init__(self, threadID, name, counter, address, typtag, tz):
        my_thread.__init__(self, threadID, name, counter)
        self.address = address
        self.typtag = typtag
        self.timezone = tz
        
    def post_event(self, event, url=API_SRV):
        global token
        data = event.encode()
        headers={'Authorization': 'JWT '+token}
        files = {'file': data}
        r = requests.post(url, files=files, headers = headers,
                          data = {'typtag': self.typtag, 'timezone': self.timezone})    

    def run(self):
        while True:
            try:
                ws = create_connection(self.address, sslopt={"cert_reqs": ssl.CERT_NONE})
                while True:
                    try: 
                        event = ws.recv()
                        self.post_event(event)
                    except:
                        logger.exception("message")
                        time.sleep(300)
                        break
            except:
                logger.exception("message")
                time.sleep(300)
        ws.close()              
        
# Create new threads
get_token_thread = get_token(1, "get_token", 1)
unr_soc_thread = get_event(2, "unr_soc", 2, "wss://www.soc.unr.edu/CybexPEvents", 'palo_alto_alert', 'US/Pacific')
bryson_honeypot_thread = get_event(3, "bryson_honeypot", 3, "ws://134.197.113.12:32323/", 'cowrie', 'US/Pacific')

# Start new Threads
get_token_thread.start()
unr_soc_thread.start()
bryson_honeypot_thread.start()

### Sample Data
##d = '{"category": "unknown", "sip": "23.50.32.116", "severity": "low", "time": "2018/12/05 14:01:32", "type": "file", "description": "DER Encoded X509 Certificate"}'
##b = d.encode()






