const language = require('@google-cloud/language');
const Storage = require('@google-cloud/storage');
const fetch = require('node-fetch');

/**
 * Triggered from a change to a Cloud Storage bucket.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 */
exports.helloGCS = async (event, context) => {
  const file = event.name
  const bucket = event.bucket
  const storage = new Storage();
  const metadata = await storage.bucket(bucket).file(file).getMetadata()
  const tourId = metadata[0].metadata.id;

  //do sentiment analysis 
  //Reference for sentiment analysis using google cloud natural language
  //https://cloud.google.com/natural-language/docs/analyzing-sentiment#language-sentiment-string-nodejs
  const client = new language.LanguageServiceClient();
  const uri = "gs://tourreviews/"+file
  const document = {
    gcsContentUri: uri,
    type: "PLAIN_TEXT",
  };
  const [result] = await client.analyzeSentiment({document});
  const sentiment = result.documentSentiment;
  const score = sentiment.score;
  
  //convert to score out of 10
  const rating = 5*(score+1);

  //send to lambda
  const response = await fetch("https://3zg49m9lti.execute-api.us-east-1.amazonaws.com/test/reviewtour", {
    method: "POST",
    body: JSON.stringify({
      id:tourId,
      rating:rating
    }),
    headers: { "Content-Type": "application/json" }
  });
  console.log("sent rating: "+rating+" for tour "+tourId);
};
