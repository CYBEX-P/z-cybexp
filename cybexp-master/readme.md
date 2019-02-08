#CYBEXP
This repository hosts the API and web gui functionality of the UNR CICI CYBEXP project.  Authentication is done via JWT and managed client side.  The DJANGO project is split into two applications:

**cybexpapi**: This app primarily holds the stand alone API functionality of the project.  It also is the primary location of all project wide data model changes such as adding the organizational id to the user profile. All other apps should import the cybexpapi.models into their application.

**cybexpweb**: This is primarily the front end web interface to the project.  This is meant to be simple one page applications that utilize JWT and the restful API.

##Installation:

**Set up Django and Python environment:
```
sudo apt-get install python3-venv
python3 -m venv cybexpenv
source cybexpenv/bin/activate
cd cybexpenv
git clone repo
pip3 install -r requirements.txt
```

##API Standards:
All APIs that return data need to use a simple JSON model with the array of data at the root level.  This will allow it to be easily consumed by the datatables library.  An example is:

{
  "data": [
    {
      "id": "1",
      "name": "Tiger Nixon",
      "position": "System Architect",
      "salary": "$320,800",
      "start_date": "2011/04/25",
      "office": "Edinburgh",
      "extn": "5421"
    },
    {
      "id": "2",
      "name": "Garrett Winters",
      "position": "Accountant",
      "salary": "$170,750",
      "start_date": "2011/07/25",
      "office": "Tokyo",
      "extn": "8422"
    }
    ]
}

##View file management
To add another view or api file create the file in the 'views' folder and then add an import statement to the __init__.py file at the root of the view directory.

Contact Farhan for passwords.