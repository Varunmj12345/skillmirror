import os

# ── Binding ───────────────────────────────────────────────────────────────────
# CRITICAL: Use $PORT from environment — cloud platforms inject this
port = os.environ.get("PORT", "8000")
bind = f"0.0.0.0:{port}"

# ── Workers ───────────────────────────────────────────────────────────────────
# Formula: (2 × CPU_cores) + 1  →  Render free = 0.1 vCPU, so keep it at 1
# Using 1 worker avoids OOM SIGKILL on free tier (512MB RAM limit)
workers = int(os.environ.get("WEB_CONCURRENCY", "1"))
worker_class = "sync"           # sync is lightest; use "gevent" only if you add it

# ── Timeouts ─────────────────────────────────────────────────────────────────
# Render kills workers after 30s by default — raise for AI/ML heavy endpoints
timeout = int(os.environ.get("GUNICORN_TIMEOUT", "120"))   # 2 min for AI calls
graceful_timeout = 30
keepalive = 5

# ── Memory / Process Limits ──────────────────────────────────────────────────
# Recycle workers after processing N requests — prevents memory bloat
max_requests = 200
max_requests_jitter = 30        # Stagger restarts to avoid thundering herd

# ── Logging ───────────────────────────────────────────────────────────────────
accesslog = "-"                 # stdout  (Render captures this)
errorlog  = "-"                 # stderr
loglevel  = "info"
access_log_format = '%(h)s "%(r)s" %(s)s %(b)s %(D)sµs'

# ── Process Naming ────────────────────────────────────────────────────────────
proc_name = "skillmirror"
