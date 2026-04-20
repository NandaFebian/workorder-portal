# Comprehensive Frontend Integration Guide: FCM Push Notifications

This guide provides a step-by-step technical walkthrough for integrating the `workorder-portal` Push Notification system into **Web** (React/Vue/Angular) and **Android** applications.

---

## 🏗️ Architectural Overview

1.  **Client Application**: Requests permission from the user and retrieves a unique **Registration Token** from FCM.
2.  **Registration**: Client sends the token to our backend via authenticated API.
3.  **Storage**: Backend associates the token with the User Profile (supporting multiple devices).
4.  **Dispatch**: When a system event occurs (e.g., WO Assignment), the backend sends a payload to FCM.
5.  **Delivery**: FCM delivers the notification to the target device(s).

---

## 🔑 Configuration Prerequisites

### 1. Web VAPID Key
To allow WebPush, you need a "Voluntary Application Server Identification" (VAPID) key.
- **Where to find**: Firebase Console > Project Settings > Cloud Messaging > Web configuration > Web Push certificates.
- **Action**: If not present, click "Generate key pair". Use this as your `vapidKey`.

### 2. Firebase Config
Ensure you have your `firebaseConfig` object from the Firebase Console (ApiKey, ProjectId, AppId, etc.).

---

## 🌐 1. Web Integration (Browser)

### Step 1: Service Worker Setup
Create `public/firebase-messaging-sw.js`. This file **must** be accessible at the root of your domain.

```javascript
/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "workorder-team",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log('[BG] Received message:', payload);
  const { title, body } = payload.notification;
  
  self.registration.showNotification(title, {
    body,
    icon: '/logo192.png',
    badge: '/badge.png',
    data: payload.data, // Important for click handling
  });
});

// Click notification handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const workOrderId = event.notification.data.workOrderId;
  const url = workOrderId ? `/work-order/${workOrderId}` : '/notifications';
  
  event.waitUntil(
    clients.openWindow(url)
  );
});
```

### Step 2: Token Registration Flow
Implement this in your main application logic (e.g., after login).

```javascript
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import axios from 'axios';

const messaging = getMessaging();

export const initializeNotifications = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return;
    }

    const currentToken = await getToken(messaging, { 
      vapidKey: 'YOUR_PUBLIC_VAPID_KEY_HERE' 
    });

    if (currentToken) {
      // Send to backend
      await axios.post('/notifications/fcm-token', { token: currentToken });
      console.log('FCM Token registered successfully');
    }
  } catch (err) {
    console.error('An error occurred while retrieving token. ', err);
  }
};

// Foreground listener
onMessage(messaging, (payload) => {
  console.log('Foreground Message:', payload);
  // Implementation: Use a Toast library (e.g., react-toastify) to show notification
});
```

---

## 📱 2. Android Integration (Kotlin)

### Step 1: Firebase Messaging Service
Register this service in your `AndroidManifest.xml`.

```kotlin
class WorkorderFcmService : FirebaseMessagingService() {

    /**
     * Called when a new token is generated (e.g., initial app install/reinstall)
     */
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        uploadTokenToBackend(token)
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        // 1. Data Payloads (Logic-heavy)
        if (remoteMessage.data.isNotEmpty()) {
            handleDataPayload(remoteMessage.data)
        }

        // 2. Notification Payloads (Visual)
        remoteMessage.notification?.let {
            showLocalNotification(it.title, it.body, remoteMessage.data)
        }
    }

    private fun uploadTokenToBackend(token: String) {
        // API call to POST /notifications/fcm-token
    }

    private fun showLocalNotification(title: String?, body: String?, data: Map<String, String>) {
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            data.forEach { (key, value) -> putExtra(key, value) }
        }
        // ... Standard NotificationManager logic here ...
    }
}
```

---

## 📡 3. Backend API Specification

### Token Registration
`POST /notifications/fcm-token`
- **Header**: `Authorization: Bearer <JWT>`
- **Body**: `{ "token": "..." }`

### Token Unregistration (Logout)
`DELETE /notifications/fcm-token`
- **Header**: `Authorization: Bearer <JWT>`
- **Body**: `{ "token": "..." }`

---

## 📑 4. Notification Data Protocols

Our backend sends specialized data objects for deep-linking. Frontend logic should switch based on these keys:

| Event Type | Title Example | Body Example | Data Payload Keys |
| :--- | :--- | :--- | :--- |
| **New Work Order** | Assigned as PIC | You are now the PIC for WO-123 | `workOrderId: "id"` |
| **Status Update** | Work Order Completed | WO-123 is now marked as Completed | `workOrderId: "id"`, `status: "completed"` |
| **New Request** | Service Request Created | Your request SR-456 has been created | `serviceRequestId: "id"` |
| **SR Status Update** | SR Status Updated | Your request SR-456 has been approved | `serviceRequestId: "id"`, `status: "approved"` |
| **Work Report Update** | Work Report Approved | The report for WO-123 has been approved | `workOrderId: "id"`, `status: "approved"` |

Frontends should use these fields to navigate the user to the correct screen when the notification is clicked.
For instance, if `workOrderId` is present, redirect to the Work Order detail page.

---

## 🛠️ 5. Troubleshooting & Best Practices

1.  **Development Environment**: Push notifications require **HTTPS** (except for `localhost`).
2.  **Incognito/Private Mode**: Service workers and notifications are often disabled in private windows.
3.  **Token Rotation**: Always call `getToken` on app startup to ensure you have the latest token, as FCM may rotate them.
4.  **Backend Cleanup**: The backend automatically removes tokens that FCM reports as expired or invalid.
5.  **Permission Revocation**: Handle cases where a user provides permission then later revokes it via browser settings.
