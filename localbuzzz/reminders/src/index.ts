/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";


// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });
admin.initializeApp();
const db = admin.firestore();


// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
export const createReminder = onRequest(async (req, res) => {
  try {
    const { phone, eventTitle, eventTime } = req.body;

    if (!phone || !eventTitle || !eventTime) {
      res.status(400).send("Missing data");
      return;
    }

    // Convert eventTime to Date
    const eventDate = new Date(eventTime);
    const remindAt = new Date(eventDate);
    remindAt.setDate(remindAt.getDate() - 1);

    await db.collection("reminders").add({
      phone,
      eventTitle,
      eventTime,
      remindAt,
      sent: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).send({ success: true });
  } catch (error) {
    logger.error(error);
    res.status(500).send("Error creating reminder");
  }
});
