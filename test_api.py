import requests
try:
    # We need a token. Let's see if we can get one or if we can find a user to login.
    # For now, let's just see if it's a 401 or 500.
    r = requests.get('http://127.0.0.1:8000/analytics/dashboard/')
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text[:500]}")
except Exception as e:
    print(f"Error: {e}")
