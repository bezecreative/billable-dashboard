import json
import os
import urllib.request
import urllib.error
from http.server import BaseHTTPRequestHandler
from datetime import datetime, timedelta, timezone
from collections import defaultdict

CLICKUP_TOKEN = os.environ.get("CLICKUP_TOKEN", "")
CLICKUP_BASE = "https://api.clickup.com/api/v2"

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
}

# ---------------------------------------------------------------------------
# ClickUp helpers
# ---------------------------------------------------------------------------

def clickup_get(path: str) -> dict:
    """Make an authenticated GET request to the ClickUp API."""
    url = f"{CLICKUP_BASE}{path}"
    req = urllib.request.Request(url, headers={"Authorization": CLICKUP_TOKEN})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode())


def get_team_id() -> str:
    data = clickup_get("/team")
    return data["teams"][0]["id"]


def get_spaces(team_id: str) -> list:
    data = clickup_get(f"/team/{team_id}/space?archived=false")
    return data.get("spaces", [])[:4]  # cap at 4 spaces


def get_lists_for_space(space_id: str) -> list:
    """Return all lists across all folders + folderless lists in a space."""
    lists = []
    # Folderless lists
    fl = clickup_get(f"/space/{space_id}/list?archived=false")
    lists.extend(fl.get("lists", []))
    # Folder lists
    folders = clickup_get(f"/space/{space_id}/folder?archived=false")
    for folder in folders.get("folders", []):
        fl2 = clickup_get(f"/folder/{folder['id']}/list?archived=false")
        lists.extend(fl2.get("lists", []))
    return lists


def get_time_entries(team_id: str, start_ms: int, end_ms: int) -> list:
    """Fetch all time entries for the team within the given epoch-ms range."""
    path = (
        f"/team/{team_id}/time_entries"
        f"?start_date={start_ms}&end_date={end_ms}&include_task_tags=true"
    )
    data = clickup_get(path)
    return data.get("data", [])


# ---------------------------------------------------------------------------
# Date range helpers
# ---------------------------------------------------------------------------

def parse_range(range_param: str, custom_start: str, custom_end: str):
    """Return (start_dt, end_dt) as timezone-aware UTC datetimes."""
    now = datetime.now(timezone.utc)
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    weekday = today.weekday()  # Monday=0

    if range_param == "this_week":
        start = today - timedelta(days=weekday)
        end = now
    elif range_param == "last_week":
        start = today - timedelta(days=weekday + 7)
        end = start + timedelta(days=7) - timedelta(seconds=1)
    elif range_param == "this_month":
        start = today.replace(day=1)
        end = now
    elif range_param == "last_month":
        first_this = today.replace(day=1)
        end = first_this - timedelta(seconds=1)
        start = end.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    elif range_param == "custom" and custom_start and custom_end:
        start = datetime.fromisoformat(custom_start).replace(tzinfo=timezone.utc)
        end = datetime.fromisoformat(custom_end).replace(tzinfo=timezone.utc)
    else:  # default this_week
        start = today - timedelta(days=weekday)
        end = now
    return start, end


# ---------------------------------------------------------------------------
# Pacing calculation
# ---------------------------------------------------------------------------

def compute_pacing(total_hours: float, start_dt: datetime, end_dt: datetime, goal: float = 80.0):
    """
    For the current week window (Mon→Fri), calculate expected hours by now.
    Returns dict: { expected, delta, status, day_fraction }
    """
    now = datetime.now(timezone.utc)
    week_start = start_dt
    week_end = week_start + timedelta(days=5)  # Friday 00:00

    total_work_seconds = (week_end - week_start).total_seconds()
    elapsed_seconds = max(0, (min(now, week_end) - week_start).total_seconds())
    day_fraction = min(1.0, elapsed_seconds / total_work_seconds)

    expected = round(goal * day_fraction, 2)
    delta = round(total_hours - expected, 2)
    status = "ahead" if delta >= 0 else "behind"
    return {
        "expected": expected,
        "actual": round(total_hours, 2),
        "delta": abs(delta),
        "status": status,
        "day_fraction": round(day_fraction, 4),
        "goal": goal,
    }


# ---------------------------------------------------------------------------
# Weekly goal history  (last 8 weeks)
# ---------------------------------------------------------------------------

def build_weekly_history(team_id: str, goal: float = 80.0) -> list:
    history = []
    now = datetime.now(timezone.utc)
    today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    weekday = today.weekday()
    this_week_start = today - timedelta(days=weekday)

    for i in range(1, 9):  # last 8 completed weeks
        w_start = this_week_start - timedelta(weeks=i)
        w_end = w_start + timedelta(days=7) - timedelta(seconds=1)
        entries = get_time_entries(
            team_id,
            int(w_start.timestamp() * 1000),
            int(w_end.timestamp() * 1000),
        )
        billable = [e for e in entries if e.get("billable") or _tag_is_billable(e)]
        total_ms = sum(int(e.get("duration", 0)) for e in billable)
        total_h = round(total_ms / 3_600_000, 2)
        history.append({
            "week": w_start.strftime("%b %d"),
            "hours": total_h,
            "goal_met": total_h >= goal,
        })
    return list(reversed(history))


def _tag_is_billable(entry: dict) -> bool:
    tags = entry.get("task_tags", []) or []
    return any("billable" in (t.get("name") or "").lower() for t in tags)


# ---------------------------------------------------------------------------
# Main aggregation
# ---------------------------------------------------------------------------

def aggregate(team_id: str, spaces: list, range_param: str, custom_start: str, custom_end: str,
              client_filter: str, employee_filter: str):
    start_dt, end_dt = parse_range(range_param, custom_start, custom_end)
    start_ms = int(start_dt.timestamp() * 1000)
    end_ms = int(end_dt.timestamp() * 1000)

    # Build client/space map
    client_map = {}  # list_id -> { name, space_name }
    for space in spaces:
        lists = get_lists_for_space(space["id"])
        for lst in lists:
            client_map[lst["id"]] = {"name": lst["name"], "space": space["name"]}

    entries = get_time_entries(team_id, start_ms, end_ms)
    billable = [e for e in entries if e.get("billable") or _tag_is_billable(e)]

    # Apply filters
    if client_filter:
        billable = [e for e in billable if _resolve_client(e, client_map) == client_filter]
    if employee_filter:
        billable = [e for e in billable
                    if (e.get("user") or {}).get("username", "") == employee_filter
                    or (e.get("user") or {}).get("id", "") == employee_filter]

    # Aggregate
    per_employee: dict = defaultdict(float)
    per_client: dict = defaultdict(float)
    per_day: dict = defaultdict(lambda: defaultdict(float))  # date -> employee -> hours
    employee_client: dict = defaultdict(lambda: defaultdict(float))

    employees_meta: dict = {}
    clients_meta: dict = {}

    for e in billable:
        dur_h = int(e.get("duration", 0)) / 3_600_000
        user = e.get("user") or {}
        uid = str(user.get("id", "unknown"))
        uname = user.get("username") or user.get("email") or uid
        employees_meta[uid] = uname

        client_name = _resolve_client(e, client_map)
        clients_meta[client_name] = client_name

        date_key = datetime.fromtimestamp(
            int(e.get("start", 0)) / 1000, tz=timezone.utc
        ).strftime("%Y-%m-%d")

        per_employee[uid] += dur_h
        per_client[client_name] += dur_h
        per_day[date_key][uid] += dur_h
        employee_client[uid][client_name] += dur_h

    total_hours = sum(per_employee.values())

    # Utilization rings (baseline = 32 h/week × number of weeks in range)
    weeks_in_range = max(1, (end_dt - start_dt).days / 7)
    baseline = 32 * weeks_in_range

    employee_rings = [
        {
            "id": uid,
            "name": employees_meta[uid],
            "hours": round(h, 2),
            "utilization": round(min(100, h / baseline * 100), 1),
            "baseline": round(baseline, 1),
            "breakdown": {c: round(v, 2) for c, v in employee_client[uid].items()},
        }
        for uid, h in per_employee.items()
    ]

    pacing = compute_pacing(total_hours, start_dt, end_dt)

    # Daily heatmap
    daily_heatmap = [
        {
            "date": date,
            "employees": {employees_meta.get(uid, uid): round(h, 2) for uid, h in emp_hours.items()},
            "total": round(sum(emp_hours.values()), 2),
        }
        for date, emp_hours in sorted(per_day.items())
    ]

    # Client bar chart
    client_chart = [
        {"client": c, "hours": round(h, 2)} for c, h in sorted(per_client.items(), key=lambda x: -x[1])
    ]

    return {
        "total_hours": round(total_hours, 2),
        "pacing": pacing,
        "employee_rings": sorted(employee_rings, key=lambda x: -x["hours"]),
        "client_chart": client_chart,
        "daily_heatmap": daily_heatmap,
        "filters": {
            "clients": sorted(clients_meta.keys()),
            "employees": [{"id": k, "name": v} for k, v in employees_meta.items()],
        },
        "range": {
            "start": start_dt.isoformat(),
            "end": end_dt.isoformat(),
            "preset": range_param,
        },
        "last_updated": datetime.now(timezone.utc).isoformat(),
    }


def _resolve_client(entry: dict, client_map: dict) -> str:
    task = entry.get("task") or {}
    list_id = (task.get("list") or {}).get("id") or task.get("list_id", "")
    if list_id and list_id in client_map:
        return client_map[list_id]["name"]
    return task.get("list", {}).get("name") or "Unknown"


# ---------------------------------------------------------------------------
# Vercel handler
# ---------------------------------------------------------------------------

class handler(BaseHTTPRequestHandler):

    def log_message(self, format, *args):  # suppress noisy access logs
        pass

    def _send(self, status: int, body: dict):
        payload = json.dumps(body).encode()
        self.send_response(status)
        for k, v in CORS_HEADERS.items():
            self.send_header(k, v)
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_OPTIONS(self):
        self.send_response(204)
        for k, v in CORS_HEADERS.items():
            self.send_header(k, v)
        self.end_headers()

    def do_GET(self):
        if not CLICKUP_TOKEN:
            self._send(500, {"error": "CLICKUP_TOKEN environment variable not set."})
            return

        # Parse query params
        from urllib.parse import urlparse, parse_qs
        qs = parse_qs(urlparse(self.path).query)
        g = lambda k, d="": (qs.get(k) or [d])[0]

        range_param = g("range", "this_week")
        custom_start = g("start")
        custom_end = g("end")
        client_filter = g("client")
        employee_filter = g("employee")
        include_history = g("history", "false") == "true"

        try:
            team_id = get_team_id()
            spaces = get_spaces(team_id)
            payload = aggregate(
                team_id, spaces, range_param, custom_start, custom_end,
                client_filter, employee_filter
            )
            if include_history:
                payload["weekly_history"] = build_weekly_history(team_id)
            self._send(200, payload)
        except urllib.error.HTTPError as exc:
            self._send(502, {"error": f"ClickUp API error: {exc.code} {exc.reason}"})
        except Exception as exc:
            self._send(500, {"error": str(exc)})
