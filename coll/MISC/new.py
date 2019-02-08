##import requests
##
##url = 'https://www.soc.unr.edu/cybexpgw/topthreatcountry'
##token = 'auth: NmU1NDUwMzFhM2VkODM1Mzk1NjVhOTIx'  
##headers={'Authorization': token}
##r = requests.get(url, headers = headers)

import pprint

data = {'buckets': [{'key': 'China', 'score': 34.893532441548544, 'bg_count': 116104, 'doc_count': 116104}, {'key': 'Canada', 'score': 2.18764754021839, 'bg_count': 22160, 'doc_count': 12720}, {'key': 'France', 'score': 1.9076880826760372, 'bg_count': 60051, 'doc_count': 19607}, {'key': 'Germany', 'score': 0.44408926040312796, 'bg_count': 22597, 'doc_count': 5813}, {'key': 'Malaysia', 'score': 0.34915680024633283, 'bg_count': 2571, 'doc_count': 1730}, {'key': 'Egypt', 'score': 0.31437739035884865, 'bg_count': 1288, 'doc_count': 1161}, {'key': 'Brazil', 'score': 0.3048497065671519, 'bg_count': 14830, 'doc_count': 3901}, {'key': 'Argentina', 'score': 0.18539203989445302, 'bg_count': 3441, 'doc_count': 1461}, {'key': 'Austria', 'score': 0.16018615027342184, 'bg_count': 533, 'doc_count': 533}, {'key': 'Curaçao', 'score': 0.14666199124470894, 'bg_count': 488, 'doc_count': 488}], 'bg_count': 198334383, 'doc_count': 810701}



import requests
url = ('https://newsapi.org/v2/everything?q=China cyber security&from=2018-11-30&to=2018-12-07&sortBy=popularity&apiKey=26f5328853114da28f274cedbc9004c0')
response = requests.get(url)
with open("result.txt", "w") as f:
    f.write(response.text)

