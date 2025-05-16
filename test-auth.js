import fetch from 'node-fetch';

async function testRegistration() {
  try {
    const response = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      }),
    });
    
    const data = await response.json();
    console.log('Response:', data);
    
    if (response.ok) {
      console.log('Registration successful!');
    } else {
      console.log('Registration failed:', data.message);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testRegistration();