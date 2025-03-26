#!/bin/bash

# Test IPinfo API using curl
# Usage: ./test-ipinfo-curl.sh [IP_ADDRESS]

# Get IP from command line arguments or use default
IP=${1:-"8.8.8.8"}
TOKEN="6d2c4eec5172aa"

echo "Testing IPinfo API for IP: $IP"

# Method 1: Token as query parameter
echo -e "\nMethod 1: Token as query parameter"
curl -s "https://ipinfo.io/$IP?token=$TOKEN"

# Method 2: Basic Auth
echo -e "\n\nMethod 2: Basic Auth"
curl -s -u "$TOKEN:" "https://ipinfo.io/$IP"

# Method 3: Bearer token
echo -e "\n\nMethod 3: Bearer token"
curl -s -H "Authorization: Bearer $TOKEN" "https://ipinfo.io/$IP"

# Method 4: Token as query parameter with /json endpoint
echo -e "\n\nMethod 4: Token as query parameter with /json endpoint"
curl -s "https://ipinfo.io/$IP/json?token=$TOKEN"

# Method 5: Basic Auth with /json endpoint
echo -e "\n\nMethod 5: Basic Auth with /json endpoint"
curl -s -u "$TOKEN:" "https://ipinfo.io/$IP/json"

# Method 6: Bearer token with /json endpoint
echo -e "\n\nMethod 6: Bearer token with /json endpoint"
curl -s -H "Authorization: Bearer $TOKEN" "https://ipinfo.io/$IP/json"

# Method 7: Token as query parameter with Accept header
echo -e "\n\nMethod 7: Token as query parameter with Accept header"
curl -s -H "Accept: application/json" "https://ipinfo.io/$IP?token=$TOKEN"

echo -e "\n"
