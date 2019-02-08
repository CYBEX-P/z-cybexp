// ===========================  INIT Functions ===========================================================
// Add any code here to hide/display or initialize contents of the gui.
$(document).ready(function() {
  //lets hide some elements.  This is better done in CSS
  $("#holdTable").hide();
  $("#dt1").hide();
});

//Quick hack to update the single sign in / sign out button when refreshing the page
window.onload = function() {
  if (window.sessionStorage.getItem("token") != null) {
    //looks like we already have an auth token so let's assume logged in
    resetAfterSignIn();
  }
};
// ========================================================================================================


// ===================================  Some Global Elements for CSS and UI =========================================

let Current_Selected_Country = null;
let current_DatabasePage = null;

// ========================================================================================================


// ============================  Interface Functions: hide/show elements and forms ========================
//Put all gui elements that need to be reset after someone signs out here
resetAfterSignout = function() {
  $("#login_logout_nav_btn").attr("data-target", "#loginModal");
  document.getElementById("login_logout_nav_btn").innerHTML = "Login";
};
//Put all gui element that need to be updated after signing in here
resetAfterSignIn = function() {
  $("#login_logout_nav_btn").attr("data-target", "#logoutModal");
  document.getElementById("login_logout_nav_btn").innerHTML = "Logout";

  // Pretty janky function to figure out which block is loaded and to perform the relevant function. This needs to be fixed.
  if(document.getElementById('Live_Data') == null && document.getElementById('upload-form') == null) {
    loadDatabase()
  } else if (document.getElementById('databaseContainer') == null && document.getElementById('upload-form') == null) {
    getEventData();
  }
};

// General purpose feedback modal
function feedbackModal(message) {
  switch (message) {
    case "file-upload-success":
      modaltitle = "File Upload Success";
      modaltext =
        '<img width=60 src="/static/cybexpweb/img/success.png"/> Successfully Uploaded File';
      break;
    case "sign-in-required":
      //looks like our jwt token may not be valid. make sure the login button is set correctly
      resetAfterSignout();
      modaltitle = "Sign In Required";
      modaltext =
        '<img width=60 src="/static/cybexpweb/img/failure.png"/> Please Sign into the Website and try again';
      break;
    case "failed-auth":
      modaltitle = "Sign In Failed";
      modaltext =
        '<img width=60 src="/static/cybexpweb/img/failure.png"/> Incorrect Username or Password';
      break;
    case "select-file-first":
      modaltile = "File Upload Failed";
      modaltext =
        '<img width=60 src="/static/cybexpweb/img/failure.png"/> Please Select a File First';
      break;
    case "bad-password-or-username":
      modaltitle = "Bad Password or Username";
      modaltext =
        '<img width=60 src="/static/cybexpweb/img/success.png"/> Failed Login, try again';
      break;
  }
  document.getElementById("modaltitle").innerHTML = modaltitle;
  document.getElementById("modalbody").innerHTML = modaltext;
  $("#myModal").modal();
}
// ===========================================================================================================

// ============================  Authentication Functions  ===================================================
//auth function to get token and use sessionstorage
auth = function(e) {
  e.preventDefault();
  //if already signed in then sign out.
  if (window.sessionStorage.getItem("token") != null) {
    window.sessionStorage.removeItem("token");
    resetAfterSignout();
  } else {
    //not signed in yet so lets authenticate them
    var xhttp = new XMLHttpRequest();
    data = {
      username: document.getElementById("username").value,
      password: document.getElementById("password").value
    };
    xhttp.onerror = function(xhr, status, err) {
      console.log(err);
    };
    xhttp.onabort = function(xhr, status, err) {
      console.log(err);
    };
    xhttp.onreadystatechange = function() {
      if (xhttp.readyState == 4 && xhttp.status == 200) {
        var response = JSON.parse(xhttp.responseText);
        window.sessionStorage.setItem("token", response.token);
        resetAfterSignIn();
      } else if (xhttp.readyState == 4 && xhttp.status == 400) {
        feedbackModal("bad-password-or-username");
      }
    };
    xhttp.open("POST", "/api-token-auth/", true);
    xhttp.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhttp.send(JSON.stringify(data));
  }
};

// ==========================================================================================================

// ======================================= Data Functions ===================================================

//OnClick function attached to database page buttons.
//Needs to be faster. 
// **Suggestion** When loading database put all data in array and then pull from array instead of a new request every time.
changeDatabasePage = function(pageNumber) {

  //Gets database div, resets database, turns parameter into int
  var Full_Div = document.getElementById("databaseItems");
  Full_Div.innerHTML = "";
  pageInt = parseInt(pageNumber);

  //Changes classes of buttons - entirely design based
  this_PageNumber = document.getElementById(`dbpage${pageNumber}`);
  current_DatabasePage.className = "database-page";
  current_DatabasePage = this_PageNumber;
  this_PageNumber.className = "Selected_database-page";

  //Requst to get data
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      
      var results = JSON.parse(xhttp.responseText);

      //Math to determine which database items to retrieve for the requested page.
      pageAmount = Math.ceil(results.data.length / 20);
      console.log(results)
      
      var toNum = (pageAmount - pageInt) * 20;
      var fromNum = (pageAmount - pageInt - 1) * 20;

      firstRow = toNum

      //Populates database from response json
      for (let i = toNum; i >= fromNum; i--) {
        if (results.data[i] != undefined) {
          var Current_Div = document.createElement("div");
          if (i == firstRow) {
            Current_Div.setAttribute("class", "databaseItems-Row-One");
          } else {
            Current_Div.setAttribute("class", "databaseItems-Row");
          }

          Description = results.data[i].objects[1]["description"];
          severityValue = results.data[i].objects[1]["severity"];
          ipAddress = results.data[i].objects[0]["value"];

          var Data_Row_Html = `<span>${Description}</span><span>${severityValue}</span><span>${ipAddress}</span>`;
          Current_Div.innerHTML = Data_Row_Html;

          Full_Div.appendChild(Current_Div);
        } else {
          firstRow --
        }
        
      }
    } else if (xhttp.readyState == 4 && xhttp.status == 401) {
      feedbackModal("sign-in-required");
    }
  };
  xhttp.open("GET", "/api/events", true);
  xhttp.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  xhttp.setRequestHeader(
    "Authorization",
    "JWT " + window.sessionStorage.getItem("token")
  );
  xhttp.send();
};

//Initial database loading function
loadDatabase = function() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      
      var results = JSON.parse(xhttp.responseText);

      //Gets page amount based upon having 20 items per page
      pageAmount = Math.ceil(results.data.length / 20);

      //Loop creates page buttons depending on amount of database items.
      for (let y = 0; y < pageAmount; y++) {
        var pageDiv = document.getElementById("databasePages");
        var currentPage = document.createElement("div");
        currentPage.setAttribute("id", `dbpage${y}`);
        currentPage.setAttribute("class", "database-page");
        currentPage.setAttribute("data-pagenumber", y);
        currentPage.setAttribute(
          "onclick",
          "changeDatabasePage(this.getAttribute('data-pagenumber'))"
        );
        currentPage.innerHTML = y + 1;
        pageDiv.appendChild(currentPage);
      }

      //Changes style of first page button
      this_PageNumber = document.getElementById(`dbpage0`);
      current_DatabasePage = this_PageNumber;
      this_PageNumber.className = "Selected_database-page";

      //Populates first database page of 20 items from response json
      for (let i = results.data.length - 1; i > results.data.length - 21; i--) {
        var Full_Div = document.getElementById("databaseItems");
        var Current_Div = document.createElement("div");
        if (i == results.data.length - 1) {
          Current_Div.setAttribute("class", "databaseItems-Row-One");
        } else {
          Current_Div.setAttribute("class", "databaseItems-Row");
        }

        Description = results.data[i].objects[1]["description"];
        severityValue = results.data[i].objects[1]["severity"];
        ipAddress = results.data[i].objects[0]["value"];

        var Data_Row_Html = `<span>${Description}</span><span>${severityValue}</span><span>${ipAddress}</span>`;
        Current_Div.innerHTML = Data_Row_Html;

        Full_Div.appendChild(Current_Div);
      }
    } else if (xhttp.readyState == 4 && xhttp.status == 401) {
      feedbackModal("sign-in-required");
    }
  };
  xhttp.open("GET", "/api/events", true);
  xhttp.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  xhttp.setRequestHeader(
    "Authorization",
    "JWT " + window.sessionStorage.getItem("token")
  );
  xhttp.send();
};

//Function used to populate data in the live dashboard.
//Also needs to be cleaned up with array function holding data.
getEventData = function() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      
      var results = JSON.parse(xhttp.responseText);

      for (let i = results.data.length - 1; i > results.data.length - 11; i--) {
        var Full_Div = document.getElementById("Live_Data_Dashboard");
        var Current_Div = document.createElement("div");
        if (i == results.data.length - 1) {
          Current_Div.setAttribute("class", "Live_Data_Dashboard-Row-One");
        } else {
          Current_Div.setAttribute("class", "Live_Data_Dashboard-Row");
        }

        Description = results.data[i].objects[1]["description"];
        severityValue = results.data[i].objects[1]["severity"];
        ipAddress = results.data[i].objects[0]["value"];

        var Data_Row_Html = `<span>${Description}</span><span>${severityValue}</span><span>${ipAddress}</span>`;
        Current_Div.innerHTML = Data_Row_Html;

        Full_Div.appendChild(Current_Div);
      }
    } else if (xhttp.readyState == 4 && xhttp.status == 401) {
      feedbackModal("sign-in-required");
    }
  };
  xhttp.open("GET", "/api/events", true);
  xhttp.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  xhttp.setRequestHeader(
    "Authorization",
    "JWT " + window.sessionStorage.getItem("token")
  );
  xhttp.send();
};

//Unused function to clear live dashboard
function clearEventData() {
  var Full_Div = document.getElementById("Live_Data_Dashboard");
  Full_Div.innerHTML = "";
}

fileUpload = function(e) {
  e.preventDefault();

  var form = document.getElementById("upload-form");
  var formData = new FormData(form);

  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4) {
      if (xhttp.status == 200) {
        feedbackModal("file-upload-success");
      } else if (xhttp.status == 401) {
        feedbackModal("sign-in-required");
      } else if (xhttp.status == 428) {
        feedbackModal("select-file-first");
      }
    }
  };
  xhttp.open("POST", "/api/events", true);
  //xhttp.setRequestHeader('Content-type', 'multipart/form-data');
  xhttp.setRequestHeader(
    "Authorization",
    "JWT " + window.sessionStorage.getItem("token")
  );
  xhttp.send(formData);
};

//------------------------------------------------------------------------
//------------ NEWS Report - Top 10 Attacking Countries ------------------
//------------------------------------------------------------------------

function addItem(candidate, List_Num) {
  List_Num += 1;
  // if (List_Num === 6) {
  //   var Full_Div = document.getElementById("list-countries");

  //   var br = document.createElement("br");
  //   Full_Div.appendChild(br);
  // }

  //Creates country button to populate articles related to that country
  var Full_Div = document.getElementById("list-countries");
  var Current_Span = document.createElement("span");
  Current_Span.setAttribute("id", candidate);
  Current_Span.setAttribute("data-country_value", candidate);
  Current_Span.setAttribute(
    "onclick",
    "getNewsbyCountry(this.getAttribute('data-country_value'),this)"
  );
  Current_Span.setAttribute("class", "News_Countries");
  Current_Span.innerHTML = `<span>${List_Num}.</span><span class='Country_nameSpan'>${candidate}</span>`;
  Full_Div.appendChild(Current_Span);
}

function removeItem(candidate) {
  var ul = document.getElementById("list-countries");
  var candidate = document.getElementById("candidate");
  var item = document.getElementById(candidate.value);
  ul.removeChild(item);
}

//Loop to create country buttons
function createCountryList(jsonData) {
  var data = JSON.parse(jsonData);
  var i;
  for (i = 0; i < 10; i++) {
    var countryName = data.buckets[i].key;
    addItem(countryName, i);
  }
}

function dateToYMD(date) {
  var d = date.getDate();
  var m = date.getMonth() + 1; //Month from 0 to 11
  var y = date.getFullYear();
  return "" + y + "-" + (m <= 9 ? "0" + m : m) + "-" + (d <= 9 ? "0" + d : d);
}

//Displays articles based upon response from getNewsbyCountry function
function showArticles(response) {
  document.getElementById("para-articles").innerHTML = "";
  var i;
  for (i = 0; i < 5; i++) {
    var Full_Div = document.getElementById("para-articles");
    var Current_Span = document.createElement("span");
    Current_Span.setAttribute("class", "data-country_article");
    Current_Url = response.articles[i].url;

    //Sometimes author can be null. So this is needed.
    if (response.articles[i].author != null) {
      var author = response.articles[i].author;
      var title = response.articles[i].title;
      var description = response.articles[i].description;
      var Article_Html = `<a href=${Current_Url} target='_blank'>${title}</a><br /><span>Author: ${author}</span><br /><span>${description}</span>`;
      Current_Span.innerHTML = Article_Html;
    } else {
      var author = "Null";
      var title = response.articles[i].title;
      var description = response.articles[i].description;
      var Article_Html = `<a href=${Current_Url} target='_blank'>${title}</a><br /><span>${description}</span>`;
      Current_Span.innerHTML = Article_Html;
    }

    Full_Div.appendChild(Current_Span);
  }
}

//Request to get news depening on country clicked
function getNewsbyCountry(countryName) {
  this_listItem = document.getElementById(countryName);
  if (Current_Selected_Country != null) {
    Current_Selected_Country.className = "News_Countries";
    Current_Selected_Country = this_listItem;
    this_listItem.className = "Selected_Country";
  } else {
    Current_Selected_Country = this_listItem;
    this_listItem.className = "Selected_Country";
  }
  var toDate = new Date();
  var fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 7);

  var url =
    "https://newsapi.org/v2/everything?" +
    "q=" +
    countryName +
    "&q=cyber security&" +
    "from=" +
    dateToYMD(fromDate) +
    "&" +
    "to=" +
    dateToYMD(toDate) +
    "&" +
    "sortBy=relevancy&" +
    "apiKey=26f5328853114da28f274cedbc9004c0";
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4) {
      if (xhttp.status == 200) {
        var response = JSON.parse(xhttp.responseText);

        showArticles(response);
      }
    }
  };
  xhttp.open("GET", url, true);
  xhttp.send();
}

getNews = function() {

  var data = {
    buckets: [
      {
        key: "China",
        score: 34.893532441548544,
        bg_count: 116104,
        doc_count: 116104
      },
      {
        key: "Canada",
        score: 2.18764754021839,
        bg_count: 22160,
        doc_count: 12720
      },
      {
        key: "France",
        score: 1.9076880826760372,
        bg_count: 60051,
        doc_count: 19607
      },
      {
        key: "Germany",
        score: 0.44408926040312796,
        bg_count: 22597,
        doc_count: 5813
      },
      {
        key: "Malaysia",
        score: 0.34915680024633283,
        bg_count: 2571,
        doc_count: 1730
      },
      {
        key: "Egypt",
        score: 0.31437739035884865,
        bg_count: 1288,
        doc_count: 1161
      },
      {
        key: "Brazil",
        score: 0.3048497065671519,
        bg_count: 14830,
        doc_count: 3901
      },
      {
        key: "Argentina",
        score: 0.18539203989445302,
        bg_count: 3441,
        doc_count: 1461
      },
      {
        key: "Austria",
        score: 0.16018615027342184,
        bg_count: 533,
        doc_count: 533
      },
      {
        key: "Curaçao",
        score: 0.14666199124470894,
        bg_count: 488,
        doc_count: 488
      }
    ],
    bg_count: 198334383,
    doc_count: 810701
  };

  var jsonData = JSON.stringify(data);
  createCountryList(jsonData);

  //Populates first country's articles in list
  getNewsbyCountry(data.buckets[0].key);
};
//--

// =================================================================================================================
