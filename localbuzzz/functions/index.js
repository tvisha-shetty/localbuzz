const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// 🔔 WHATSAPP WEBHOOK (SCAFFOLD)
exports.whatsappWebhook = functions.https.onRequest(async (req, res) => {
  try {
    // Example payload WhatsApp would send
    const message = req.body.message || "";

    /**
     * Expected future WhatsApp message format:
     * "Event: Ganesh Puja
     *  Date: 19 Sept
     *  Location: Society Hall
     *  Category: Religious"
     */

    // 🚧 TEMP MOCK PARSING
    const event = {
      title: "WhatsApp Event",
      date: "Unknown",
      location: "From WhatsApp",
      category: "Social",
      stats: { views: 0, saves: 0, attends: 0 },
      source: "whatsapp",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection("events").add(event);

    res.status(200).send("Event received from WhatsApp");
  } catch (error) {
    console.error(error);
    res.status(500).send("Webhook error");
  }
});
