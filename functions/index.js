const { onRequest } = require('firebase-functions/v2/https')
const admin = require('firebase-admin')

admin.initializeApp()

exports.sendNotification = onRequest(
  {
    region: 'asia-south1',
    cors: true, // ✅ Built-in CORS handling
  },
  async (req, res) => {
    try {
      console.log('Request body:', req.body)

      let body = req.body

      // Handle string body (edge cases)
      if (typeof body === 'string') {
        body = JSON.parse(body)
      }

      const { userIds, payload } = body

      if (!userIds || !Array.isArray(userIds)) {
        return res.status(400).send({ error: 'Invalid userIds' })
      }

      const db = admin.database()
      const updates = {}
      const notificationMap = {}

      // 🔥 Create notifications
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

      // ✅ Save to DB
      await db.ref().update(updates)

      // ✅ Send FCM
      for (const uid of userIds) {
        const tokenSnap = await db.ref(`fcmTokens/${uid}`).once('value')
        const tokenData = tokenSnap.val()

        // 🌐 Web Push
        if (tokenData?.web?.token) {
          await admin.messaging().send({
            token: tokenData.web.token,
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

        // 📱 Mobile Push
        if (tokenData?.mobile?.token) {
          await admin.messaging().send({
            token: tokenData.mobile.token,
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
            notification: {
              title: payload.title,
              body: payload.body,
            },
            android: {
              notification: {
                channelId: 'default_v2',
                sound: 'notification_sound',
              },
            },
          })
        }
      }

      return res.status(200).send({ success: true })
    } catch (error) {
      console.error(error)
      return res.status(500).send({ error: error.message })
    }
  },
)
