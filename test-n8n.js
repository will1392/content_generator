const https = require('https');

async function testN8nWorkflow() {
  const data = JSON.stringify({
    keyword: "artificial intelligence",
    projectId: "test-123"
  });

  const options = {
    hostname: 'apex-creatives.app.n8n.cloud',
    port: 443,
    path: '/webhook-test/research',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    console.log('Sending request to n8n webhook...');
    console.log('URL:', `https://${options.hostname}${options.path}`);
    console.log('Payload:', data);
    console.log('---');

    const req = https.request(options, (res) => {
      let responseData = '';

      console.log('Response Status:', res.statusCode);
      console.log('Response Headers:', res.headers);
      console.log('---');

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        console.log('Response received!');
        console.log('Response body:');
        try {
          const parsed = JSON.parse(responseData);
          console.log(JSON.stringify(parsed, null, 2));
        } catch (e) {
          console.log(responseData);
        }
        resolve(responseData);
      });
    });

    req.on('error', (error) => {
      console.error('Request error:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Run the test
console.log('Starting n8n workflow test...');
console.log('Timestamp:', new Date().toISOString());
console.log('===================================\n');

testN8nWorkflow()
  .then(() => {
    console.log('\n===================================');
    console.log('Test completed successfully');
    console.log('Timestamp:', new Date().toISOString());
  })
  .catch((error) => {
    console.error('\n===================================');
    console.error('Test failed:', error);
    console.log('Timestamp:', new Date().toISOString());
  });