importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
firebase.initializeApp({
  'messagingSenderId': '<your-messagingSenderId>'
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {

  console.log('received bg-msg ', payload);
  var content = payload.data.notification;
  var dataObj = JSON.parse(content);

  const notificationTitle = dataObj.title;
  const notificationOptions = {
    body: dataObj.body,
    icon: dataObj.icon,
    tag: dataObj.tag,
    data : {url: dataObj.click_action}, //news link
    // image: dataObj.icon //big picture
  };

  var notification = self.registration.showNotification(notificationTitle,notificationOptions);
  return notification;
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(self.clients.openWindow(event.notification.data.url));
});
