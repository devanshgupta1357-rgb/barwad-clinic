// createAccount.js
fetch('http://localhost:8080/api/setup', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        username: 'drbarwad', // You can change this
        password: 'adminpassword123' // You can change this
    })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));