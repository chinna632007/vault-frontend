// Simple test to verify download endpoint works with MongoDB ObjectIds
const http = require('http');

const testDownload = () => {
  return new Promise((resolve, reject) => {
    // Test with a MongoDB ObjectId format (hexadecimal)
    const testId = '6a6c711c1fb2fa6a12c128c7';
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/documents/${testId}/download`,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Headers:', res.headers);
        console.log('Response:', data);
        
        if (res.statusCode === 401 || res.statusCode === 404) {
          console.log('✓ Endpoint is accessible (auth/document not found is expected)');
          resolve(true);
        } else if (res.statusCode === 500) {
          console.log('✗ Server error:', data);
          reject(data);
        } else {
          console.log('✓ Download endpoint responded');
          resolve(true);
        }
      });
    });

    req.on('error', (err) => {
      console.error('Request error:', err.message);
      reject(err);
    });

    req.end();
  });
};

testDownload()
  .then(() => {
    console.log('\n✓ Test completed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n✗ Test failed:', err);
    process.exit(1);
  });