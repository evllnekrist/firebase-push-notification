/*__________________________________________________________________________push my-company main __*/ 

var config = {
    apiKey: "<your-apiKey>",
    authDomain: "<your-authDomain>",
    databaseURL: "<your-databaseURL>",
    storageBucket: "<your-storageBucket>",
    messagingSenderId: "<your-messagingSenderId>"
};
firebase.initializeApp(config);
const messaging = firebase.messaging();

navigator.serviceWorker.register('/fm-sw.js')// you place the sw on the root
.then((fmsw) => {
    messaging.useServiceWorker(fmsw);
    // console.log(Notification.permission);
	 if (Notification.permission == 'granted') {
	 	console.log('permission granted');
	}else if (Notification.permission == 'default' || Notification.permission == 'prompt') {
		console.log('ask for permission');
	    permissionReq();
	}else if (Notification.permission == 'denied') {
		console.log('permission denied');
	}
}).catch((err) => {
    console.log("missin' service worker\n", err);
});
console.log('poi is on');
/*__________________________________________________________________________the functions __*/ 

function permissionReq(){
    var miliseconds = (Math.abs(new Date().getTime() - getCookie('webnotif-refuse')));
    
    if(checkCookie('webnotif-refuse') == false || rangeTime(miliseconds) > 2){
        if(checkCookie('webnotif') == false){
            setTimeout(function(){ displayPOI() }, 5000);
            // console.log('requesting for your device permission');
        }else{
            // console.log("the token has been registered");
        }
    }else{
        // console.log("your device has refuse to get notification");
        if(checkCookie('webnotif') == true){
            deleteCookie('webnotif-refuse','my-company.com'); 
            // console.log("erasing webnotif-refuse since webnotif is activated");
        }else{
            console.log("po is diactivated");
        }
    }
}

function displayPOI(){
    var confirmBox = $("#confirm");
    confirmBox.find(".no").unbind().click(function() {
       confirmBox.hide();
       setCookie('webnotif-refuse', new Date().getTime(), 100, 'my-company.com');
    });
    confirmBox.find(".yes").unbind().click(function() {
       confirmBox.hide();
       deleteCookie('webnotif-refuse','my-company.com');
       retrieveCurrentToken();
    });
    confirmBox.show();
}

function displayNotif(){ /*not apply yet__*/
    messaging.onMessage(function(msg) {
        console.log("Message received, ", msg);
        /*xxx.innerHTML = JSON.stringify(payload)__*/ 
    });
}

function storeToken(token) { //this depend on your api
    var urlpush = 'https://webpush.my-company.com/administrator/auth_push/auth_token';
    var canal = 'wp';
    var source = 'web';
    // console.log("check token availability..");

    $.ajax({
        type: 'POST',
        url: urlpush,
        data: {key: token, can:canal, src: source},
        success: function (msg) {
            console.log(msg); /*catch the message returned by api__*/
            return true;
        }
    });
}

function getToken(){
    messaging.getToken().then((deviceToken) => {
        if(deviceToken){ 
            setCookie('webnotif', deviceToken, 100, 'my-company.com');
            storeToken(deviceToken);
        }else{
            // console.log("push notification disabled");
        }
    }).catch((err) => {
        // console.log("retrieving device token failed.\n", err);
    })
}

function retrieveCurrentToken(){ /* <-- retrieve the current token__*/
    messaging.requestPermission().then(function () {
        // console.log("notification permission granted.");
        getToken();
    })
    .catch(function (err) {
        // console.log("unable to get permission to notify.\n", err);
    });
}

function retrieveNewToken() { /* <-- refresh mean create new token  //not apply yet__*/
    messaging.onTokenRefresh(function () {
        getToken();
    });
}

function setCookie(cname, cvalue, exdays, domain) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/;domain=" + domain + ";";
    // console.log("cookie "+cname+" set");
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkCookie(cname) {
    // console.log('check cookies availability..\n');
    if (getCookie(cname)!=='') {
          return true;
    }
    return false;
}

function deleteCookie(cname, domain) {
    var expires = "expires=Thu, 01 Jan 1970 00:00:00 UTC;"
    document.cookie = cname + "=;" + expires + ";path=/;domain=" + domain + ";";
    // console.log("cookie "+cname+" deleted");
}

function rangeTime(miliseconds){
    total_seconds = parseInt(Math.floor(miliseconds / 1000));
    total_minutes = parseInt(Math.floor(total_seconds / 60));
    total_hours = parseInt(Math.floor(total_minutes / 60));
    days = parseInt(Math.floor(total_hours / 24));
    // console.log(miliseconds + "ms - " + total_seconds + "s - " + total_minutes + "m - " + total_hours + "h - " + days + "d");

    return days;
}