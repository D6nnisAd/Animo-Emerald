// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDogB8ViVjajhdYDbdLa8ggky4lalgwgkE",
    authDomain: "animo-website.firebaseapp.com",
    databaseURL: "https://animo-website-default-rtdb.firebaseio.com",
    projectId: "animo-website",
    storageBucket: "animo-website.firebasestorage.app",
    messagingSenderId: "249453136869",
    appId: "1:249453136869:web:d7009c4b5a261f13b73d0c"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app(); // if already initialized, use that one
}

const db = firebase.firestore();
const auth = firebase.auth();