const Storage = require('@google-cloud/storage');
const fetch = require('node-fetch');
/**
 * Responds to HTTP requests.
 https://stackoverflow.com/questions/42145759/do-google-cloud-platform-http-functions-support-route-parameters
 https://cloud.google.com/functions/docs/writing/http
 */
 exports.toursApi = async(req, res) => {
    var path = req.path;
    var method = req.method;
    var body = req.body;
  
    if (method === "POST") {
      //Request recommendations from recommendTours cloud function 
      if (path === "/recommendtour") {
        var tours = [];
        try {
          var duration = body.duration;
          var durationString = duration.toString();
          tours = await recommendTours(durationString);
        } catch (err) {
          console.log(err);
        }
        res.status(200).send({
          "tours" : tours
        });
        return;
      
      //Save to cloud storage bucket which will trigger reviewTour cloud function
      } else if (path === "/reviewtour") {
        var date = new Date(Date.now());
        var newFile = date.getFullYear()+"-"+date.getMonth()+"-"+date.getDate()+"-"+date.getSeconds()+"-"+date.getMilliseconds();
        const storage = new Storage();
        await storage.bucket("tourreviews").file(newFile).save(body.review);
        await storage.bucket("tourreviews").file(newFile).setMetadata({metadata:{"id": body.id}});        
        res.status(200).send("review recorded");
        return;
      }
    }
    res.status(400).send("forbidden");
  }

//Function to get recommendation from ML model
//Reference: https://cloud.google.com/vertex-ai/docs/samples/aiplatform-predict-tabular-classification-sample
const recommendTours = async(duration) => {

  const response = await fetch("https://us-east1-serverless-355702.cloudfunctions.net/recommendTours", {
    method: "POST",
    body: JSON.stringify({
      duration:duration,
    }),
    headers: { "Content-Type": "application/json" }
  });
  const pairs = await response.json();

  pairs.sort((a,b)=>b.prob-a.prob)
  console.log(pairs)

  //return top 3 recommendations
  const result = pairs.map(a => ('0'+a.label)).slice(0,3);
  return result;
}