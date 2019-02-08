from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.http import HttpResponse
from rest_framework import status
import pytz
from datetime import datetime
import gridfs
from cybexpapi.scripts.loaddb import loaddb
from cybexpapi.scripts.crypto import encrypt_file
from pymongo import MongoClient
from django.conf import settings
import json


class events(APIView): 
    permission_classes = (IsAuthenticated,)

    def get(self, request, format=None):
        db = loaddb("report")
        events = db.events
        cursor = events.find({}, {'_id': False})
        output = {'data':[]} 
        for e in cursor:
            output['data'].append(e)
        return Response(output)

    def post(self, request, format=None):
        db = loaddb('cache')
        fs = gridfs.GridFS(db)

        f = request.FILES
        if not any(f):
            return HttpResponse(status=status.HTTP_428_PRECONDITION_REQUIRED)
        f = f['file']
        fenc = encrypt_file(f.read())

        info = {}
        info['datetime'] = datetime.now(pytz.utc).isoformat()
        info['orgid'] = request.user.profile.orgid
        info['fid'] = fs.put(fenc, filename=f.name)
        info['processed'] = False
        info['typtag'] = request.data['typtag']
        info['timezone'] = request.user.profile.tzname

        coll = db.file_entries
        i = coll.insert_one(info)
        return HttpResponse(status=status.HTTP_200_OK)

##
### Create your views here.
class public(APIView):
        permission_classes = (AllowAny, )

        def get(self, request, format=None):
                snippet = {'a': 1, 'c': 3, 'b': 2}
                return Response(snippet)

class private(APIView):
	permission_classes = (IsAuthenticated, )

	def get(self, request, format=None):
    		user = request.user
    		content = {
			'data': 'Username is ' + user.username
    		}
    		return Response(content)
