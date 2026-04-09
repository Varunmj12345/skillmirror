import sys

try:
    import importlib.metadata as metadata
    print("PKG_OK", metadata.__file__)
except Exception as e:
    print("PKG_ERR", str(e))

print("PY", sys.executable)
