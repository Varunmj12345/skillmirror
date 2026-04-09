import json, urllib.request

url = 'http://127.0.0.1:8000/api/ai/generate-roadmap/'
data = json.dumps({"job":"Data Scientist","skills":["Python","ML","Pandas"]}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type':'application/json'})
with urllib.request.urlopen(req, timeout=10) as resp:
    print(resp.status)
    print(resp.read().decode('utf-8'))
