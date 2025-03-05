/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()

const db = admin.firestore()
const storage = admin.storage()

// User Functions
exports.onUserCreated = functions.auth.user().onCreate(async (user) => {
  try {
    await db.collection('users').doc(user.uid).set({
      name: user.displayName || user.email.split('@')[0],
      email: user.email,
      photoURL: user.photoURL || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      projectCount: 0,
      totalViews: 0,
      totalLikes: 0
    })
  } catch (error) {
    console.error('Error creating user document:', error)
  }
})

// Project Functions
exports.recordProjectView = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in')
  }

  const { projectId } = data
  if (!projectId) {
    throw new functions.https.HttpsError('invalid-argument', 'Project ID required')
  }

  try {
    const projectRef = db.collection('projects').doc(projectId)
    await projectRef.update({
      views: admin.firestore.FieldValue.increment(1)
    })
    return { success: true }
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message)
  }
})