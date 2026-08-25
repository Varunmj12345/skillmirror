import os
import json
import logging
import requests
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class LLMResponse:
    def __init__(self, content: str, raw: dict = None):
        self.content = content
        self.raw = raw or {}
        self.choices = [type('Choice', (), {'message': type('Message', (), {'content': content})()})()]

def get_active_provider_and_key() -> tuple[Optional[str], Optional[str]]:
    """
    Auto-detects provider and API key from environment variables.
    Supports xAI (Grok), Groq, and OpenAI.
    """
    # 1. Check explicit XAI key
    xai_key = os.environ.get("XAI_API_KEY")
    if xai_key and xai_key.startswith("xai-"):
        return "xai", xai_key

    # 2. Check GROQ key (or mislabeled xai key in GROQ_API_KEY)
    groq_key = os.environ.get("GROQ_API_KEY")
    if groq_key:
        if groq_key.startswith("xai-"):
            return "xai", groq_key
        elif groq_key.startswith("gsk_") and groq_key != "gsk_your_key_here":
            return "groq", groq_key

    # 3. Check OPENAI key
    openai_key = os.environ.get("OPENAI_API_KEY")
    if openai_key and openai_key.startswith("sk-"):
        return "openai", openai_key

    return None, None

def chat_completion(
    messages: List[Dict[str, str]],
    model: Optional[str] = None,
    response_format: Optional[Dict[str, str]] = None,
    temperature: float = 0.7,
    max_tokens: Optional[int] = None
) -> LLMResponse:
    """
    Universal LLM dispatcher supporting xAI (Grok), Groq (LLaMA-3.3), and OpenAI.
    """
    provider, api_key = get_active_provider_and_key()

    if not provider or not api_key:
        raise ValueError("No valid AI API Key configured. Please set GROQ_API_KEY or XAI_API_KEY.")

    # ─── 1. xAI (Grok) ───────────────────────────────────────────────────────────
    if provider == "xai":
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
        
        # Fallback to grok-2 if grok-beta fails with 400
        if resp.status_code == 400:
            payload["model"] = "grok-2"
            resp = requests.post("https://api.x.ai/v1/chat/completions", headers=headers, json=payload, timeout=60)

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
        return LLMResponse(content=content, raw=res_json)

    # ─── 2. Groq (LLaMA-3.3 / LLaMA-3.1) ──────────────────────────────────────────
    elif provider == "groq":
        try:
            from groq import Groq
            client = Groq(api_key=api_key)
            chosen_model = model if model and ("llama" in model or "mixtral" in model) else "llama-3.3-70b-versatile"
            
            kwargs = {
                "messages": messages,
                "model": chosen_model,
                "temperature": temperature,
            }
            if max_tokens:
                kwargs["max_tokens"] = max_tokens
            if response_format:
                kwargs["response_format"] = response_format

            try:
                completion = client.chat.completions.create(**kwargs)
            except Exception as e:
                # If primary model fails, fallback to 8b instant
                if "llama-3.3" in chosen_model:
                    kwargs["model"] = "llama-3.1-8b-instant"
                    completion = client.chat.completions.create(**kwargs)
                else:
                    raise e

            content = completion.choices[0].message.content
            return LLMResponse(content=content)
        except Exception as e:
            raise RuntimeError(f"Groq API Error: {e}")

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
        if resp.status_code != 200:
            raise RuntimeError(f"OpenAI API Error ({resp.status_code}): {resp.text}")

        res_json = resp.json()
        content = res_json["choices"][0]["message"]["content"]
        return LLMResponse(content=content, raw=res_json)

    raise ValueError(f"Unsupported provider: {provider}")
