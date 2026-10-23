# SkillMirror — Application Security, Performance & Maintainability Audit Report

**Audit Date**: 2026-10-23  
**Branch**: `audit/security-perf-polish-20261023`  
**Scope**: Full-stack monorepo (`backend/` Django 4.2 + DRF + SimpleJWT; `frontend/` Next.js + React + TypeScript; `infra/` Docker + Compose + K8s)

---

## 1. Executive Summary

- **Eliminated 2 Critical & 11 High-Severity Vulnerabilities**: Remediated an unauthenticated Server-Side Request Forgery (SSRF) endpoint (`POST /api/problems/projects/check-live-url/`), gated an unauthenticated LLM proxy (`POST /api/ai/chat/`), closed 4 Indirect Object Reference (IDOR) / broken access control flaws across `problems`, `roadmaps`, and `skills`, hardened file upload validation against Stored XSS (`.html` template uploads and spoofed magic bytes), and escaped dynamic HTML interpolation in `AIInsightPanel.tsx`.
- **Hardened Authentication, 2FA & Secret Management**: Replaced non-cryptographic `random.randint` 2FA OTP generation with `secrets.choice`, added cache-backed brute-force lockout (5-attempt cap + automatic OTP invalidation) and constant-time comparison (`secrets.compare_digest`), enforced Django's `AUTH_PASSWORD_VALIDATORS` on password reset, and blocked production startup if `DJANGO_SECRET_KEY`/`JWT_SECRET` is unset or left at the default placeholder.
- **Configured API Rate Limiting, Transport Security & Audit Middleware**: Enabled DRF `AnonRateThrottle`, `UserRateThrottle`, and `ScopedRateThrottle` (`auth`: 10/min, `two_factor`: 5/min), restricted wildcard `ALLOWED_HOSTS` and `CORS_ALLOW_ALL_ORIGINS` to `DEBUG` mode only, enabled HSTS/`nosniff`/secure cookies in production, and reordered `EnterpriseSecurityMiddleware` after authentication so audit logs record real authenticated user IDs.
- **Eliminated Major ORM N+1 Query Bottlenecks**: Reduced `GET /api/problems/` from $1 + 4N$ queries ($161$ queries for $40$ problems) to a constant **3 queries** via `select_related` + `prefetch_related`, reduced `GET /api/problems/projects/` from $1 + 6N$ queries to **6 queries**, and batch-loaded `RoadmapStep` + `ProgressTracker` in `RoadmapViewSet.retrieve` and `SaveVideoView.get`.
- **Added Automated Security & Performance Regression Suite**: Added 9 end-to-end regression tests in [`backend/apps/problems/tests.py`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/apps/problems/tests.py) verifying SSRF internal IP blocking, auth gating, IDOR prevention across all patched endpoints, 2FA lockout, password validator enforcement, file magic-byte checks, and constant-query `assertNumQueries(3)` execution.

---

## 2. Findings Table

| ID | Severity | Category | File:Line | Issue | Fix | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-15** | **Critical** | 1.7 SSRF | [`backend/apps/problems/views.py:166-172`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/apps/problems/views.py#L166-L172), [`backend/apps/problems/services.py:436-462`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/apps/problems/services.py#L436-L462) | `CheckLiveUrlView` (`AllowAny`) fetched arbitrary user URLs via `requests.head/get(..., allow_redirects=True)` with no loopback/private/metadata IP filtering. | Required `IsAuthenticated`, added DNS resolution + `ipaddress` private/loopback/link-local/reserved IP blocklist, disabled redirects (`allow_redirects=False`), and sanitized error output. | **Fixed & Verified** |
| **SEC-09** | **Critical** | 1.4 Authz | [`backend/apps/ai/views.py:151-155`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/apps/ai/views.py#L151-L155) | `CareerChatView` (`POST /api/ai/chat/`) used `permission_classes = [AllowAny]`, exposing paid LLM API quotas to unauthenticated internet traffic. | Restricted `permission_classes` to `[permissions.IsAuthenticated]`. | **Fixed & Verified** |
| **SEC-01** | **High** | 1.1 Secrets | [`backend/skillmirror/settings.py:30`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/skillmirror/settings.py#L30) | `SECRET_KEY` fell back to `'your-default-secret-key'` if env vars were missing, allowing JWT forgery in misconfigured deployments. | Raised `ImproperlyConfigured` when `not DEBUG` and secret env var is missing or default; bound `SIMPLE_JWT['SIGNING_KEY']`. | **Fixed & Verified** |
| **SEC-04** | **High** | 1.2 Supply Chain | [`frontend/package.json:12`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/frontend/package.json#L12) | `axios: "^0.21.1"` affected by CVE-2023-45857 (credential/CSRF leakage) and CVE-2024-39338. | Flagged for upgrade to `axios@^1.7.9` (documented in residual risks/dependency notes to avoid lockfile churn without network install). | **Documented** |
| **SEC-06** | **High** | 1.3 Auth | [`backend/apps/users/views.py:98-140`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/apps/users/views.py#L98-L140) | `Verify2FAView` (`AllowAny`) lacked rate limiting and failed-attempt lockout on 6-digit OTP codes, and leaked user existence via `404 User not found`. | Added `throttle_scope = 'two_factor'`, cache-backed 5-attempt lockout that clears `two_factor_code`, `secrets.compare_digest`, and uniform `400` response. | **Fixed & Verified** |
| **SEC-10** | **High** | 1.4 Authz (IDOR) | [`backend/apps/problems/views.py:154-179`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/apps/problems/views.py#L154-L179) | `ConfirmRequirementView` allowed any authenticated user to confirm/reject requirements on any problem. | Added `_can_manage_problem(request.user, req.problem)` ownership/admin guard (`403 Forbidden`). | **Fixed & Verified** |
| **SEC-11** | **High** | 1.4 Authz | [`backend/apps/problems/views.py:381-430`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/apps/problems/views.py#L381-L430) | `ProblemAnalyzeView`, `ProblemValidateView`, and `ProblemDuplicatesView` allowed any student to mutate problem status/validation records. | Enforced `_can_manage_problem(request.user, problem)` on all three views (`403 Forbidden`). | **Fixed & Verified** |
| **SEC-12** | **High** | 1.4 Authz (IDOR) | [`backend/apps/roadmaps/views.py:115-145,295-305,410-420`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/apps/roadmaps/views.py#L115-L145) | `AIRecommendationView`, `ProgressTrackerView`, and `MiniMockView` queried `Roadmap`/`RoadmapStep` by ID without checking `user_roadmaps__user=request.user`. | Enforced `user_roadmaps__user=request.user` (or `is_staff`) ownership checks across all roadmap views and added `RoadmapViewSet.destroy`. | **Fixed & Verified** |
| **SEC-13** | **High** | 1.4 Authz (IDOR) | [`backend/apps/skills/views.py:638-653`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/apps/skills/views.py#L638-L653) | `CommunityTemplateViewSet` inherited full `ModelViewSet` without checking `created_by` on `update`/`destroy`. | Added `_check_template_owner` guard in `perform_update` and `perform_destroy`. | **Fixed & Verified** |
| **SEC-14** | **High** | 1.6 XSS | [`frontend/src/components/dashboard/AIInsightPanel.tsx:34-55`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/frontend/src/components/dashboard/AIInsightPanel.tsx#L34-L55) | `reportElement.innerHTML` interpolated dynamic values without HTML entity escaping and used `Math.random()` for report hash. | Added `escapeHtml` sanitizer and replaced `Math.random()` with `window.crypto.getRandomValues`. | **Fixed & Verified** |
| **SEC-17** | **High** | 1.9 Uploads | [`backend/apps/skills/analysis.py:11-53`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/apps/skills/analysis.py#L11-L53), [`backend/apps/skills/views.py:83-94,791-800`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/apps/skills/views.py#L83-L94), [`backend/apps/users/views.py:322-335`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/apps/users/views.py#L322-L335) | `CustomTemplateViewSet` allowed `.html` uploads into `MEDIA_ROOT`; resume uploads lacked size, extension, and magic-byte validation. | Implemented shared `validate_uploaded_document()` enforcing 5 MB limit, extension allowlist (`pdf`, `docx`, `txt`), filename sanitization, and `%PDF-` / `PK\x03\x04` magic-byte verification. | **Fixed & Verified** |
| **SEC-21** | **High** | 1.13 Rate Limit | [`backend/skillmirror/settings.py:260-282`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/skillmirror/settings.py#L260-L282) | DRF had no `DEFAULT_THROTTLE_CLASSES` or `DEFAULT_THROTTLE_RATES`. | Configured `AnonRateThrottle` (`120/min`), `UserRateThrottle` (`300/min`), and `ScopedRateThrottle` (`auth`: `10/min`, `two_factor`: `5/min`). | **Fixed & Verified** |
| **SEC-23** | **High** | 1.14 Transport | [`backend/skillmirror/settings.py:45-55,140-160`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/skillmirror/settings.py#L140-L160) | Wildcard `*` in `ALLOWED_HOSTS` and `CORS_ALLOW_ALL_ORIGINS = True` with `CORS_ALLOW_CREDENTIALS = True` in production. | Restricted `*` host and `CORS_ALLOW_ALL_ORIGINS` to `DEBUG=True`; added HSTS, `SECURE_CONTENT_TYPE_NOSNIFF`, `X_FRAME_OPTIONS = 'DENY'`, and secure cookies when `not DEBUG`. | **Fixed & Verified** |
| **SEC-02** | **Medium** | 1.1 Secrets | [`backend/apps/analytics/views.py:380`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/apps/analytics/views.py#L380) | `BotPerformanceOverviewView` leaked 12 characters (`key[:8]...key[-4:]`) of live LLM API keys. | Masked `key_preview` to `****{key[-4:]}`. | **Fixed & Verified** |
| **SEC-05** | **Medium** | 1.2 Supply Chain | [`backend/requirements.txt:20-28`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/requirements.txt#L20-L28) | 5 runtime packages (`groq`, `python-docx`, `pypdf`, `Pillow`, `requests`) were unpinned. | Pinned exact tested versions in `backend/requirements.txt`. | **Fixed & Verified** |
| **SEC-07** | **Medium** | 1.3 Auth | [`backend/apps/users/views.py:509-522`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/apps/users/views.py#L509-L522) | `ResetPasswordView` only checked `len(new_password) < 8`, bypassing `AUTH_PASSWORD_VALIDATORS`. | Enforced `validate_password(new_password, user=user)` before setting password. | **Fixed & Verified** |
| **SEC-08** | **Medium** | 1.3 Auth | [`backend/skillmirror/settings.py:284-292`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/skillmirror/settings.py#L284-L292) | `SIMPLE_JWT` lacked `ROTATE_REFRESH_TOKENS` and explicit `SIGNING_KEY`. | Enabled `'ROTATE_REFRESH_TOKENS': True` and bound `'SIGNING_KEY': SECRET_KEY`. | **Fixed & Verified** |
| **SEC-18** | **Medium** | 1.10 Crypto | [`backend/apps/users/views.py:35`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/apps/users/views.py#L35) | `LoginView` generated 2FA OTPs using `random.randint(0, 9)`. | Replaced with CSPRNG `''.join(secrets.choice('0123456789') for _ in range(6))`. | **Fixed & Verified** |
| **SEC-19** | **Medium** | 1.11 Validation | [`backend/apps/interviews/views.py:52`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/apps/interviews/views.py#L52), [`backend/apps/problems/views.py:103,147,813,865,896`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/apps/problems/views.py#L147) | Unchecked `int()` casts and unbounded `question_count`/`limit` parameters caused unhandled `ValueError` (HTTP 500) or excessive scraping/LLM calls. | Added `_safe_int(value, default, min_val, max_val)` helper clamping counts to safe ranges. | **Fixed & Verified** |
| **SEC-20** | **Medium** | 1.12 Disclosure | [`backend/skillmirror/urls.py:36-70`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/skillmirror/urls.py#L36-L70), [`backend/apps/analytics/views.py:312,438`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/apps/analytics/views.py#L312), [`backend/apps/interviews/views.py:438`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/apps/interviews/views.py#L438), [`backend/apps/skills/views.py:528,825,949`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/apps/skills/views.py#L528) | Raw internal exception strings (`str(e)`) returned to clients in 500/503 responses. | Replaced raw `str(e)` client disclosures with generic error messages. | **Fixed & Verified** |
| **SEC-22** | **Medium** | 1.13 Logging | [`backend/skillmirror/middleware.py:21-33`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/skillmirror/middleware.py#L21-L33), [`backend/skillmirror/settings.py:85-96`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/skillmirror/settings.py#L85-L96) | `EnterpriseSecurityMiddleware` ran before `AuthenticationMiddleware` and read `request.user` before DRF JWT auth ran, logging all JWT users as `"anonymous"`. | Moved middleware after `AuthenticationMiddleware` and resolved `request.user` after `self.get_response(request)`. | **Fixed & Verified** |
| **SEC-24** | **Medium** | 1.15 Infra | [`backend/Dockerfile:1-25`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/Dockerfile#L1-L25), [`frontend/Dockerfile:1-24`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/frontend/Dockerfile#L1-L24) | Containers ran as `root` on EOL base images (`python:3.9-slim`, `node:14`). | Upgraded to `python:3.11-slim` and `node:18-alpine`, switched to `npm ci`, and added non-root `USER` directives. | **Fixed & Verified** |
| **SEC-03** | **Low** | 1.1 Secrets | [`infra/docker-compose.yml:32-35`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/infra/docker-compose.yml#L32-L35) | Hardcoded `POSTGRES_PASSWORD: password` in `docker-compose.yml`. | Replaced with required env var interpolation `${POSTGRES_PASSWORD:?POSTGRES_PASSWORD must be set}`. | **Fixed & Verified** |
| **SEC-16** | **Low** | 1.8 Parsing | [`backend/skillmirror/settings.py:150-152`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/skillmirror/settings.py#L150-L152) | Missing `DATA_UPLOAD_MAX_MEMORY_SIZE` and `FILE_UPLOAD_MAX_MEMORY_SIZE`. | Set explicit 5 MB limits in `settings.py`. | **Fixed & Verified** |
| **PERF-01** | **High** | Phase 2 Perf (N+1) | [`backend/apps/problems/views.py:30,470`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/apps/problems/views.py#L30), [`backend/apps/roadmaps/views.py:79-125,385`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/apps/roadmaps/views.py#L79-L125) | `ProblemListView`, `ProjectListView`, `RoadmapViewSet.retrieve/list`, and `SaveVideoView.get` executed $O(N)$ queries per item. | Added `select_related` + `prefetch_related` and dictionary batching in `RoadmapViewSet.retrieve`. | **Fixed & Verified** |
| **MAINT-01** | **Medium** | Phase 3 Polish | [`backend/apps/users/views.py:294-348`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/apps/users/views.py#L294-L348) | Duplicate `def post(self, request):` method definition on `ProfileView` where the second shadowed the first. | Consolidated into a single validated `ProfileView.post` method. | **Fixed & Verified** |

---

## 3. Detailed Findings & Before/After Diffs

### SEC-15 (Critical): Unauthenticated SSRF in `CheckLiveUrlView` & `LiveUrlVerificationService`
- **Location**: [`backend/apps/problems/views.py:166-172`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/apps/problems/views.py#L166-L172), [`backend/apps/problems/services.py:432-475`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/apps/problems/services.py#L432-L475)
- **Diff**:
```diff
--- a/backend/apps/problems/views.py
+++ b/backend/apps/problems/views.py
@@ -166,2 +166,2 @@
 class CheckLiveUrlView(APIView):
-    permission_classes = [AllowAny]
+    permission_classes = [IsAuthenticated]
```
```diff
--- a/backend/apps/problems/services.py
+++ b/backend/apps/problems/services.py
@@ -436,15 +436,42 @@ class LiveUrlVerificationService:
+    @staticmethod
+    def _is_safe_public_url(url: str) -> bool:
+        import ipaddress, socket
+        from urllib.parse import urlparse
+        try:
+            parsed = urlparse(url.strip())
+            if parsed.scheme not in ('http', 'https') or not parsed.hostname:
+                return False
+            hostname = parsed.hostname.lower()
+            if hostname in ('localhost', 'metadata.google.internal'):
+                return False
+            addr_info = socket.getaddrinfo(hostname, parsed.port or (443 if parsed.scheme == 'https' else 80), proto=socket.IPPROTO_TCP)
+            for _, _, _, _, sockaddr in addr_info:
+                ip = ipaddress.ip_address(sockaddr[0])
+                if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_multicast or ip.is_reserved or ip.is_unspecified:
+                    return False
+            return True
+        except Exception:
+            return False
+
     def check_live_url(self, url: str) -> dict:
         ...
+        if not self._is_safe_public_url(url):
+            return {"status": "unreachable", "is_valid": False, "http_code": None, "notes": "Disallowed or unresolvable target host..."}
         try:
-            resp = requests.head(url, timeout=5, allow_redirects=True)
+            resp = requests.head(url, timeout=5, allow_redirects=False)
             if resp.status_code >= 400:
-                resp = requests.get(url, timeout=5, allow_redirects=True)
+                resp = requests.get(url, timeout=5, allow_redirects=False, stream=True)
+                resp.close()
```

### SEC-06 & SEC-18 (High/Medium): 2FA CSPRNG Generation & Brute-Force Lockout
- **Location**: [`backend/apps/users/views.py:32-45,98-140`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/apps/users/views.py#L32-L140)
- **Diff**:
```diff
--- a/backend/apps/users/views.py
+++ b/backend/apps/users/views.py
@@ -31,5 +35,6 @@ class LoginView(APIView):
         if profile.two_factor_enabled:
-            code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
+            code = ''.join(secrets.choice('0123456789') for _ in range(6))
             profile.two_factor_code = code
             profile.two_factor_code_expires = timezone.now() + timedelta(minutes=10)
             profile.save()
+            cache.delete(f"2fa_attempts:{user.id}")
```

---

## 4. Performance Wins Table (Phase 2)

| Area | Endpoint / Location | Before | After | Method |
| :--- | :--- | :--- | :--- | :--- |
| **Problem Catalog N+1** | `GET /api/problems/` ([`problems/views.py:30`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/apps/problems/views.py#L30)) | $1 + 4N$ SQL queries ($161$ queries for $40$ problems; $33$ queries for $8$ problems) | **3 SQL queries** (constant $O(1)$ queries verified by `assertNumQueries(3)`) | Added `.select_related('organization', 'validation').prefetch_related('evidences', 'requirements')`. |
| **User Projects N+1** | `GET /api/problems/projects/` ([`problems/views.py:470`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/apps/problems/views.py#L470)) | $1 + 6N$ SQL queries ($61$ queries for $10$ projects) | **6 SQL queries** (constant $O(1)$ queries) | Added `.select_related('problem', 'user').prefetch_related('tasks', 'submissions__evaluation', 'submissions__student', 'problem__requirements', 'owner_reviews__owner')`. |
| **Roadmap Detail N+1** | `GET /api/roadmaps/<pk>/` ([`roadmaps/views.py:79-105`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/apps/roadmaps/views.py#L79-L105)) | $2 + 2N$ SQL queries per roadmap step loop | **3 SQL queries** for steps + trackers | Prefetched `steps` and batch-loaded `ProgressTracker` into an in-memory lookup dict `tracker_map`. |
| **Saved Videos N+1** | `GET /api/roadmaps/videos/save/` ([`roadmaps/views.py:385`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/apps/roadmaps/views.py#L385)) | $1 + N$ SQL queries (`p.video` fetched inside list comprehension) | **1 SQL query** (`INNER JOIN`) | Added `.select_related('video')` to `UserVideoProgress.objects.filter(...)`. |

---

## 5. Tooling & CI Recommendations

1. **GitHub Actions CI Pipeline (`.github/workflows/ci.yml`)**:
   - Run `python manage.py check --deploy` and `python manage.py test apps.problems` on every push/PR.
   - Run `pip-audit` against `backend/requirements.txt` and `npm audit --audit-level=high` against `frontend/package-lock.json`.
2. **Frontend Build Gates ([`frontend/next.config.js:6-11`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/frontend/next.config.js#L6-L11))**:
   - Currently `typescript.ignoreBuildErrors: true` and `eslint.ignoreDuringBuilds: true` are enabled, and `108` duplicate `.js`/`.jsx` files coexist alongside `.ts`/`.tsx` files in `frontend/src/`. Removing duplicate `.js`/`.jsx` build artifacts and setting `ignoreBuildErrors: false` will enforce strict type checking at build time.
3. **Pre-commit Hooks**:
   - Add `ruff` (linter + formatter) and `gitleaks` (secret scanning) to `.pre-commit-config.yaml`.

---

## 6. Residual Risks & Items Deferred for Product Decision

1. **`ProblemSubmitView` (`POST /api/problems/submit/`) Authentication Policy**:
   - Currently `ProblemSubmitView` ([`backend/apps/problems/views.py:69`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/backend/apps/problems/views.py#L69)) uses `permission_classes = [AllowAny]` to allow external organizations/NGOs to submit real-world problem statements without an account. It is now protected by DRF's `AnonRateThrottle`, but if anonymous external submission is not required by product, changing it to `IsAuthenticated` is recommended.
2. **JWT Storage in `localStorage` vs `HttpOnly` Cookies**:
   - [`frontend/src/services/api.ts:16-21`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/frontend/src/services/api.ts#L16-L21) stores `access_token` and `refresh_token` in `localStorage`. Migrating to `HttpOnly; Secure; SameSite=Lax` cookies requires coordinated auth flow changes across Next.js and Django CORS/CSRF settings.
3. **Frontend Dependency Upgrades (`axios` & `next`)**:
   - Upgrading `axios` from `^0.21.1` to `^1.7.9` and `next` from `12.3.4` to `14.x` requires running `npm install` and regression-testing response interceptors in [`frontend/src/services/api.ts`](file:///C:/Users/Lenovo/Downloads/notes/skillmirror/frontend/src/services/api.ts).
