'use strict';

const qs = require('querystring');
const AWS = require('aws-sdk');

const BUCKET = 'thekevinwang-website-items';

const PREFIX = 'key';
var COUNTER = 0;

var FILENAME = PREFIX + COUNTER;
// var FILENAME = 'key0';

exports.fooHandler = async function(event, context, callback) {
  // Rip out things like the resource, HTTP method, and payload for a request
  // if any.
  const http_method = event.httpMethod;
  const content = event.body;

  console.log('THIS IS SOME CONTENT: ' + JSON.stringify(content));

  // Here, we figure out "what to do", based upon the HTTP method that's used
  // The "await async" syntax is a bit far out...
  const result = await (async function() {
    switch (http_method) {
    case 'GET': {
      let keys = [];
      let objects = [];
      // Use GetObject API to pull a file off of AWS S3
      const data = await getObjectFromS3(FILENAME);

      // const data = await listObjectsFromS3();

      console.log('S3.getObject: ' + JSON.stringify(data));
      // return data.Body.toString('utf-8');

      // return data.Contents;

      return {
        // data.Body.toString('utf-8'), // The returned body is a Buffer
        body: JSON.parse(data.Body.toString()),
        date: data.LastModified.toDateString(),
        time: data.LastModified.toLocaleTimeString(),
      };
    }

    case 'POST': {
        // Use the request parameters to save something into S3
        //const content = 'abcdefghijklmnopqrstuvwxyz'; // dummy value

        const data = await putObjectToS3(FILENAME, content);
        console.log('S3.putObject: ' + JSON.stringify(data));
        return data;
    }

    default:
        return 'No action';
    }
  })();

  // const responseBody = {
  //     // message: 'Greetings! This is a message brought to you by our "SomeFunctionName" lambda function!',
  //     // action: `I see you issued a "${http_method}" request! Congrats!`,
  //     // request: JSON.stringify(event),
  //     // item: result,
  //     // createdAt:
  //     item: result
  // };

  const responseBody = result;

  // The output from a Lambda proxy integration must be
  // of the following JSON object. The 'headers' property
  // is for custom response headers in addition to standard
  // ones. The 'body' property  must be a JSON string.
  const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'true'
      },
      body: JSON.stringify(responseBody)
  };
  callback(null, response);
};


function getObjectFromS3(key) {
  const s3 = new AWS.S3();
  const params = {
      Bucket: BUCKET,
      Key: key,
  };
  return s3.getObject(params).promise();
  // return s3.getObject(params);
}

function listObjectsFromS3() {
  const s3 = new AWS.S3();
  const params = {
      Bucket: BUCKET,
      MaxKeys: 10,
  };
  return s3.listObjects(params).promise();
}

// Note: Body : JSON.stringify(data)
function putObjectToS3(key, data){
  const s3 = new AWS.S3();
  const params = {
      Bucket : BUCKET,
      Key : key,
      Body : data
  };
  return s3.putObject(params).promise();
}
