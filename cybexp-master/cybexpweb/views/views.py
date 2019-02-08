from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.conf import settings
from django.core.files.storage import FileSystemStorage
#from cybexpweb.views.forms import DocumentForm
from django.views.decorators.csrf import csrf_protect, csrf_exempt
from rest_framework import status
from django.views.decorators.http import require_POST
from pymongo import MongoClient
from django.core.files.storage import default_storage
import gridfs


def index(request):
	# model_form_upload(request)
	return render(request, "cybexpweb/index.html")
def home(request):
    return render(request,'cybexpweb/home.html')

def about(request):
    return render(request,'cybexpweb/about.html')

def contactus(request):
    return render(request,'cybexpweb/contactus.html')

def profile(request):
    return render(request,'cybexpweb/profile.html')

def upload(request):
    return render(request,'cybexpweb/upload.html')

def database(request):
    return render(request,'cybexpweb/database.html')

# def navbar(request):
#     return render(request,'cybexpweb/navbar.html')
