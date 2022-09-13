const express = require("express");
const app = express();
const Firestore = require("@google-cloud/firestore");
const cors = require("cors");

const COLLECTION_NAME = "cipherKeys";
const PROJECT_ID = "bnbproject-g17";

const db = new Firestore({
  projectId: PROJECT_ID,

  timestampsInSnapshots: true,
});

app.use(cors());

app.get("/", (req, res) => {
  res.send("Storing to Firestore works!!");
});

const decryptCipher = async (encryptedCipher, randomKey) => {
  console.log("encryptedCipher", encryptedCipher);
  console.log("decKey", randomKey);
  const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var decryptedCipher = "";
  for (var i = 0; i < encryptedCipher.length; ++i) {
    var index = alphabets.indexOf(encryptedCipher[i]) - randomKey;
    if (index < 0) {
      index = index + 26;
    }
    decryptedCipher = decryptedCipher + alphabets[index];
  }
  console.log("decryptedCipher", decryptedCipher);
  return decryptedCipher;
};

const fetchDataFromFireStore = async (email) => {
  console.log("fetching users");
  try {
    const users = await db.collection(COLLECTION_NAME).get();
    console.log("users", users);
    console.log("*********");
    let key;
    for (let i = 0; i < users.docs.length; i++) {
      if (users.docs[i].data().email === email) {
        key = users.docs[i].data().key;
        console.log("db user key", key);
      }
    }
    return key;
  } catch (e) {
    console.log(e);
  }
};

app.post("/", async (req, res) => {
  const { email, ciphertxt, usercipher } = req.body;
  console.log("body", req.body);
  console.log("EMail:  " + email);
  let keyy;
  let result;
  keyy = await fetchDataFromFireStore(email);
  console.log("userkey", keyy);
  var ans = await decryptCipher(usercipher, keyy);
  if (ans == ciphertxt) {
    console.log("all good");
    result = true;
  } else {
    console.log("Not matched");
    result = false;
  }

  res.status(200).send(result);
});

exports.app = app;
