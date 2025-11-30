const https = require('https');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/bikes?brand=benelli',
  method: 'GET'
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('API Response for Benelli bikes:');
      
      if (result.success && result.data.bikes) {
        result.data.bikes.forEach((bike, index) => {
          console.log(`${index + 1}. ${bike.name}`);
          console.log(`   Brand: ${bike.brand.name}`);
          console.log(`   Price: ₹${bike.price ? bike.price.toLocaleString('en-IN') : 'N/A'}`);
          console.log('---');
        });
      } else {
        console.log('No bikes found or error in response');
      }
    } catch (error) {
      console.error('Error parsing response:', error.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  // Try HTTP instead of HTTPS
  const http = require('http');
  const httpReq = http.request({...options, port: 3000}, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('API Response for Benelli bikes:');
        
        if (result.success && result.data.bikes) {
          result.data.bikes.forEach((bike, index) => {
            console.log(`${index + 1}. ${bike.name}`);
            console.log(`   Brand: ${bike.brand.name}`);
            console.log(`   Price: ₹${bike.price ? bike.price.toLocaleString('en-IN') : 'N/A'}`);
            console.log('---');
          });
        } else {
          console.log('No bikes found or error in response');
          console.log('Response:', result);
        }
      } catch (error) {
        console.error('Error parsing response:', error.message);
        console.log('Raw response:', data);
      }
    });
  });

  httpReq.on('error', (error) => {
    console.error('Error making request:', error.message);
  });

  httpReq.end();
});

req.end();