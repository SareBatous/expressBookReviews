curl -s -c cookie.txt -X POST http://localhost:5000/customer/login -H 'Content-Type: application/json' -d '{"username":"user1","password":"pass123"}'
