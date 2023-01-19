const functions = require('firebase-functions');
// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();
//Firebase realtime database
const db = admin.firestore();

// I use express for easier testing, writing, and implementation of functions
const express = require('express')
const app = express()

module.exports = {
   app,
   db,
   functions,
   admin
};