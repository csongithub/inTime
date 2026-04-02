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

      for (const uid of userIds) {
        const notifRef = db.ref(`notifications/${uid}`).push()

        updates[`notifications/${uid}/${notifRef.key}`] = {
          ...payload,
          createdAt: Date.now(),
          read: false,
        }
      }

      // Save notifications
      await db.ref().update(updates)

      // Send FCM
      for (const uid of userIds) {
        const tokenSnap = await db.ref(`fcmTokens/${uid}`).once('value')
        const tokenData = tokenSnap.val()

        if (!tokenData?.token) continue

        // await admin.messaging().send({
        //   token: tokenData.token,
        //   notification: {
        //     title: payload.title,
        //     body: payload.body,
        //   },
        //   // data: {
        //   //   type: payload.type || 'general',
        //   //   refId: payload.refId || '',
        //   // },
        // })

        await admin.messaging().send({
          token: tokenData.token,
          data: {
            title: payload.title,
            body: payload.body,
            type: payload.type || 'general',
            entityId: payload.entityId || '',
            communityId: payload.communityId || '',
            commentId: payload.commentId || '',
          },
        })
      }

      res.status(200).send({ success: true })
    } catch (error) {
      console.error(error)
      res.status(500).send({ error: error.message })
    }
  })
})
