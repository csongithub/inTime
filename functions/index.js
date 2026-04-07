const { onRequest } = require('firebase-functions/v2/https')
const admin = require('firebase-admin')
const cors = require('cors')({ origin: true })

admin.initializeApp()

exports.sendNotification = onRequest({ region: 'asia-south1' }, (req, res) => {
  cors(req, res, async () => {
    try {
      // ✅ Handle preflight
      if (req.method === 'OPTIONS') {
        res.status(204).send('')
        return
      }
      console.log('Request body:', req.body)
      let body = req.body

      // Handle string body (Chrome issue)
      if (typeof body === 'string') {
        body = JSON.parse(body)
      }

      const { userIds, payload } = body

      const db = admin.database()
      const updates = {}

      if (!userIds || !Array.isArray(userIds)) {
        throw new Error('Invalid userIds')
      }

      // 🔥 NEW: store notificationIds per user
      const notificationMap = {}

      for (const uid of userIds) {
        const notifRef = db.ref(`notifications/${uid}`).push()
        const notificationId = notifRef.key

        notificationMap[uid] = notificationId

        updates[`notifications/${uid}/${notificationId}`] = {
          ...payload,
          createdAt: Date.now(),
          read: false,
        }
      }

      // ✅ Save notifications
      await db.ref().update(updates)

      // ✅ Send FCM
      for (const uid of userIds) {
        const tokenSnap = await db.ref(`fcmTokens/${uid}`).once('value')
        const tokenData = tokenSnap.val()

        if (tokenData?.web?.token) {
          console.log('Web Token: ' + tokenData.web.token)
          await admin.messaging().send({
            token: tokenData.web.token,
            //data payload for web platform
            data: {
              title: payload.title,
              body: payload.body,
              type: payload.type || 'general',
              entityId: String(payload.entityId || ''),
              communityId: String(payload.communityId || ''),
              commentId: String(payload.commentId || ''),
              notificationId: String(notificationMap[uid] || ''),
              uid: String(uid),
            },
          })
        }

        if (tokenData?.mobile?.token) {
          console.log('Mobile Token: ' + tokenData.mobile.token)
          await admin.messaging().send({
            token: tokenData.mobile.token,
            // notification payload for mobile/native platform
            data: {
              title: payload.title,
              body: payload.body,
              type: payload.type || 'general',
              entityId: String(payload.entityId || ''),
              communityId: String(payload.communityId || ''),
              commentId: String(payload.commentId || ''),
              notificationId: String(notificationMap[uid] || ''),
              uid: String(uid),
              // icon: 'ic_stat_notification',
            },
            notification: {
              title: payload.title,
              body: payload.body,
            },
            // 🔥 CRITICAL (THIS FIXES SOUND)
            android: {
              notification: {
                channelId: 'default_v2', // MUST match app
                sound: 'notification_sound',
              },
            },
          })
        }
      }
      res.status(200).send({ success: true })
    } catch (error) {
      console.error(error)
      res.status(500).send({ error: error.message })
    }
  })
})
