import os
import json
import time
import logging
import requests
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

# Primary active Groq API Key and default models
DEFAULT_GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
DEFAULT_GROQ_PRIMARY_MODEL = os.getenv("DEFAULT_GROQ_MODEL", "openai/gpt-oss-120b")
DEFAULT_GROQ_FAST_MODEL = os.getenv("FAST_GROQ_MODEL", "openai/gpt-oss-20b")

# Resilient model priority sequence for Groq
GROQ_MODEL_FALLBACK_CHAIN = [
    DEFAULT_GROQ_PRIMARY_MODEL,
    DEFAULT_GROQ_FAST_MODEL,
    "qwen/qwen3.8-27b",
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
]

class LLMResponse:
    def __init__(self, content: str, raw: dict = None, usage: dict = None, latency_ms: float = 0.0):
        self.content = content
        self.raw = raw or {}
        self.usage = usage or {}
        self.latency_ms = latency_ms
        self.choices = [type('Choice', (), {'message': type('Message', (), {'content': content})()})()]

def get_active_provider_and_key() -> tuple[Optional[str], Optional[str]]:
    """
    Auto-detects provider and API key from environment variables or secure defaults.
    Supports Groq, xAI (Grok), and OpenAI.
    """
    # 1. Check GROQ key
    groq_key = os.environ.get("GROQ_API_KEY") or DEFAULT_GROQ_API_KEY
    if groq_key:
        if groq_key.startswith("xai-"):
            return "xai", groq_key
        elif groq_key.startswith("gsk_") and groq_key != "gsk_your_key_here":
            return "groq", groq_key

    # 2. Check explicit XAI key
    xai_key = os.environ.get("XAI_API_KEY")
    if xai_key and xai_key.startswith("xai-"):
        return "xai", xai_key

    # 3. Check OPENAI key
    openai_key = os.environ.get("OPENAI_API_KEY")
    if openai_key and openai_key.startswith("sk-"):
        return "openai", openai_key

    return "groq", DEFAULT_GROQ_API_KEY

def chat_completion(
    messages: List[Dict[str, str]],
    model: Optional[str] = None,
    response_format: Optional[Dict[str, str]] = None,
    temperature: float = 0.7,
    max_tokens: Optional[int] = None,
    interaction_type: str = "career_chat",
    user = None,
    session_id: Optional[str] = None
) -> LLMResponse:
    """
    Universal LLM dispatcher supporting Groq (with auto-fallback), xAI, and OpenAI.
    Includes automated performance timing and telemetry recording to BotPerformanceAnalyticsEngine.
    """
    provider, api_key = get_active_provider_and_key()

    if not provider or not api_key:
        raise ValueError("No valid AI API Key configured. Please set GROQ_API_KEY or XAI_API_KEY.")

    t_start = time.perf_counter()
    prompt_str = " ".join([m.get("content", "") for m in messages if m.get("role") == "user"])

    # ─── 1. Groq (Ultra-Low Latency Inference) ───────────────────────────────────
    if provider == "groq":
        try:
            from groq import Groq
            client = Groq(api_key=api_key)
            
            # Determine initial model candidate
            initial_model = model or DEFAULT_GROQ_PRIMARY_MODEL
            candidate_models = [initial_model] + [m for m in GROQ_MODEL_FALLBACK_CHAIN if m != initial_model]

            completion = None
            used_model = initial_model
            last_err = None

            for candidate in candidate_models:
                kwargs = {
                    "messages": messages,
                    "model": candidate,
                    "temperature": temperature,
                }
                if max_tokens:
                    kwargs["max_tokens"] = max_tokens
                if response_format:
                    kwargs["response_format"] = response_format

                try:
                    completion = client.chat.completions.create(**kwargs)
                    used_model = candidate
                    break
                except Exception as e:
                    last_err = e
                    logger.warning(f"[Groq LLM] Model {candidate} failed: {e}. Trying next fallback...")
                    continue

            if completion is None:
                raise RuntimeError(f"All Groq candidate models failed. Last error: {last_err}")

            t_elapsed_ms = (time.perf_counter() - t_start) * 1000.0
            content = completion.choices[0].message.content or ""

            # Extract usage metrics
            usage_obj = getattr(completion, 'usage', None)
            prompt_tokens = getattr(usage_obj, 'prompt_tokens', 0) if usage_obj else 0
            completion_tokens = getattr(usage_obj, 'completion_tokens', 0) if usage_obj else 0
            total_tokens = getattr(usage_obj, 'total_tokens', 0) if usage_obj else 0
            queue_time = getattr(usage_obj, 'queue_time', 0.0) or 0.0
            comp_time = getattr(usage_obj, 'completion_time', 0.0) or 0.0

            # Safe telemetry logging
            try:
                from apps.analytics.bot_analytics import BotPerformanceAnalyticsEngine
                BotPerformanceAnalyticsEngine.record_interaction(
                    interaction_type=interaction_type,
                    provider="groq",
                    model=used_model,
                    latency_ms=t_elapsed_ms,
                    status="success",
                    status_code=200,
                    prompt_text=prompt_str,
                    response_text=content,
                    prompt_tokens=prompt_tokens,
                    completion_tokens=completion_tokens,
                    total_tokens=total_tokens,
                    queue_time_ms=queue_time * 1000.0,
                    generation_time_ms=comp_time * 1000.0,
                    user=user,
                    session_id=session_id
                )
            except Exception as log_err:
                logger.warning(f"Telemetry logging error: {log_err}")

            return LLMResponse(
                content=content,
                raw=getattr(completion, '__dict__', {}),
                usage={"prompt_tokens": prompt_tokens, "completion_tokens": completion_tokens, "total_tokens": total_tokens},
                latency_ms=t_elapsed_ms
            )

        except Exception as e:
            t_elapsed_ms = (time.perf_counter() - t_start) * 1000.0
            try:
                from apps.analytics.bot_analytics import BotPerformanceAnalyticsEngine
                BotPerformanceAnalyticsEngine.record_interaction(
                    interaction_type=interaction_type,
                    provider="groq",
                    model=model or DEFAULT_GROQ_PRIMARY_MODEL,
                    latency_ms=t_elapsed_ms,
                    status="error",
                    status_code=500,
                    prompt_text=prompt_str,
                    error_message=str(e),
                    user=user,
                    session_id=session_id
                )
            except Exception:
                pass
            raise RuntimeError(f"Groq API Error: {e}")

    # ─── 2. xAI (Grok) ───────────────────────────────────────────────────────────
    elif provider == "xai":
        chosen_model = model if model and ("grok" in model) else "grok-beta"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": chosen_model,
            "messages": messages,
            "temperature": temperature
        }
        if max_tokens:
            payload["max_tokens"] = max_tokens
        if response_format and response_format.get("type") == "json_object":
            payload["response_format"] = {"type": "json_object"}

        resp = requests.post("https://api.x.ai/v1/chat/completions", headers=headers, json=payload, timeout=60)
        t_elapsed_ms = (time.perf_counter() - t_start) * 1000.0

        if resp.status_code == 400:
            payload["model"] = "grok-2"
            resp = requests.post("https://api.x.ai/v1/chat/completions", headers=headers, json=payload, timeout=60)
            t_elapsed_ms = (time.perf_counter() - t_start) * 1000.0

        if resp.status_code != 200:
            err_data = resp.text
            try:
                err_json = resp.json()
                err_data = err_json.get("error", err_data)
            except Exception:
                pass
            raise RuntimeError(f"xAI API Error ({resp.status_code}): {err_data}")

        res_json = resp.json()
        content = res_json["choices"][0]["message"]["content"]

        try:
            from apps.analytics.bot_analytics import BotPerformanceAnalyticsEngine
            BotPerformanceAnalyticsEngine.record_interaction(
                interaction_type=interaction_type,
                provider="xai",
                model=chosen_model,
                latency_ms=t_elapsed_ms,
                status="success",
                status_code=200,
                prompt_text=prompt_str,
                response_text=content,
                user=user,
                session_id=session_id
            )
        except Exception:
            pass

        return LLMResponse(content=content, raw=res_json, latency_ms=t_elapsed_ms)

    # ─── 3. OpenAI ───────────────────────────────────────────────────────────────
    elif provider == "openai":
        chosen_model = model or "gpt-4o-mini"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": chosen_model,
            "messages": messages,
            "temperature": temperature
        }
        if max_tokens:
            payload["max_tokens"] = max_tokens
        if response_format:
            payload["response_format"] = response_format

        resp = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload, timeout=60)
        t_elapsed_ms = (time.perf_counter() - t_start) * 1000.0

        if resp.status_code != 200:
            raise RuntimeError(f"OpenAI API Error ({resp.status_code}): {resp.text}")

        res_json = resp.json()
        content = res_json["choices"][0]["message"]["content"]

        try:
            from apps.analytics.bot_analytics import BotPerformanceAnalyticsEngine
            BotPerformanceAnalyticsEngine.record_interaction(
                interaction_type=interaction_type,
                provider="openai",
                model=chosen_model,
                latency_ms=t_elapsed_ms,
                status="success",
                status_code=200,
                prompt_text=prompt_str,
                response_text=content,
                user=user,
                session_id=session_id
            )
        except Exception:
            pass

        return LLMResponse(content=content, raw=res_json, latency_ms=t_elapsed_ms)

    raise ValueError(f"Unsupported provider: {provider}")
