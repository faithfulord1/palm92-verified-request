#!/usr/bin/env python3
"""PALM92 Chief of Staff: private local prototype server.

Serves the UI and proxies planning requests to a locally installed Ollama.
It never executes shell commands, sends messages, submits forms, or publishes.
"""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json
import os
import urllib.request
import urllib.error

ROOT = Path(__file__).parent.resolve()
WEB = ROOT / "web"
STATE = ROOT / "state.json"
HOST = "127.0.0.1"
PORT = int(os.environ.get("PALM92_PORT", "8765"))
OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://127.0.0.1:11434")
MODEL = os.environ.get("OLLAMA_MODEL", "qwen2.5:7b")

def read_state():
    if STATE.exists():
        try:
            return json.loads(STATE.read_text())
        except (ValueError, OSError):
            pass
    return {"projects": [], "tasks": []}

def write_state(state):
    tmp = STATE.with_suffix(".tmp")
    tmp.write_text(json.dumps(state, indent=2))
    tmp.replace(STATE)

def ask_ollama(project):
    prompt = f"""You are PALM92 Chief, one project manager for Faith. Turn this project into a small, practical work plan.
Return ONLY valid JSON with keys summary and tasks. summary is one sentence. tasks is an array of 4 to 7 objects with keys title, role, purpose, acceptance_criteria, risk, status. role must be one of Research, Design, Build, Review. status must be Proposed. Keep tasks independent where possible, sequence dependencies in purpose, avoid invented facts, do not perform external actions. The human is the project manager and approves consequential actions.
Project brief: {project}
"""
    body = json.dumps({"model": MODEL, "stream": False, "format": "json", "messages": [
        {"role": "system", "content": "Return concise, well-formed JSON only."},
        {"role": "user", "content": prompt}
    ]}).encode()
    req = urllib.request.Request(OLLAMA_URL.rstrip("/") + "/api/chat", data=body,
                                 headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=180) as response:
        raw = json.loads(response.read())
    result = json.loads(raw["message"]["content"])
    if not isinstance(result.get("tasks"), list) or not result["tasks"]:
        raise ValueError("Ollama returned no task list")
    return result

class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        # Keep request bodies, prompts and personal content out of logs.
        print("[PALM92 local] " + (fmt % args).split(" ")[0])

    def send_json(self, code, value):
        data = json.dumps(value).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if self.path == "/api/health":
            self.send_json(200, {"ok": True, "ollama_model": MODEL, "ollama_url": OLLAMA_URL,
                                 "shell_enabled": False, "bind": HOST})
            return
        if self.path == "/api/state":
            self.send_json(200, read_state())
            return
        name = "index.html" if self.path == "/" else self.path.lstrip("/")
        target = (WEB / name).resolve()
        if not str(target).startswith(str(WEB.resolve())) or not target.is_file():
            self.send_error(404)
            return
        data = target.read_bytes()
        mime = "text/html; charset=utf-8" if target.suffix == ".html" else "text/plain; charset=utf-8"
        self.send_response(200)
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        try:
            body = json.loads(self.rfile.read(int(self.headers.get("Content-Length", "0"))))
        except (ValueError, OSError):
            self.send_json(400, {"error": "Invalid JSON"})
            return
        if self.path == "/api/plan":
            brief = str(body.get("brief", "")).strip()
            if not brief or len(brief) > 5000:
                self.send_json(400, {"error": "Enter a project brief of 1 to 5,000 characters."})
                return
            try:
                plan = ask_ollama(brief)
            except urllib.error.URLError as e:
                self.send_json(503, {"error": f"Local Ollama is not reachable at {OLLAMA_URL}. Start Ollama and check the model name ({MODEL})."})
                return
            except Exception as e:
                self.send_json(502, {"error": f"Planning failed: {type(e).__name__}: {e}"})
                return
            project = {"id": os.urandom(6).hex(), "title": brief[:72], "brief": brief,
                       "summary": plan.get("summary", ""), "created": __import__("datetime").datetime.now().isoformat(timespec="minutes")}
            state = read_state()
            state["projects"].append(project)
            for task in plan["tasks"]:
                state["tasks"].append({"id": os.urandom(6).hex(), "project_id": project["id"],
                    "title": str(task.get("title", "Untitled task"))[:120],
                    "role": task.get("role", "Build"), "purpose": str(task.get("purpose", ""))[:500],
                    "acceptance_criteria": str(task.get("acceptance_criteria", ""))[:500],
                    "risk": str(task.get("risk", ""))[:300], "status": "Proposed"})
            write_state(state)
            self.send_json(200, {"project": project, "tasks": [t for t in state["tasks"] if t["project_id"] == project["id"]]})
            return
        if self.path == "/api/task-status":
            state = read_state()
            task = next((t for t in state["tasks"] if t["id"] == body.get("id")), None)
            if not task:
                self.send_json(404, {"error": "Task not found"})
                return
            if body.get("status") not in ["Proposed", "In progress", "Review", "Approved", "Blocked"]:
                self.send_json(400, {"error": "Invalid status"})
                return
            task["status"] = body["status"]
            write_state(state)
            self.send_json(200, task)
            return
        self.send_error(404)

if __name__ == "__main__":
    print(f"PALM92 Chief available on http://{HOST}:{PORT}")
    print(f"Ollama endpoint: {OLLAMA_URL} | model: {MODEL} | shell execution: disabled")
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
