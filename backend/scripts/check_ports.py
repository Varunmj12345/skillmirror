import socket
hosts = ['127.0.0.1','10.154.237.131']
for host in hosts:
    s = socket.socket()
    s.settimeout(2)
    try:
        s.connect((host, 8000))
        print(f"{host} => OPEN")
    except Exception as e:
        print(f"{host} => CLOSED ({e})")
    finally:
        s.close()
