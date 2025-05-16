import fetch from 'node-fetch';

async function testLogin() {
  try {
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });
    
    const data = await response.json();
    console.log('Response:', data);
    
    if (response.ok) {
      console.log('Login successful!');
      console.log('Note: We cannot test /api/auth/user endpoint from Node.js because we cannot handle cookies properly.');
      console.log('This endpoint needs to be tested from the browser where cookies are automatically managed.');
    } else {
      console.log('Login failed:', data.message);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testLogin();