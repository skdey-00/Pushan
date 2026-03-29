"""
Enhanced Flask API Server - Analytics, Override Endpoints and System Status
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from decision import set_override, clear_override, get_override_state
from main import get_system_state
from datetime import datetime, timedelta
from collections import defaultdict
import threading
import time

app = Flask(__name__)
CORS(app)

# ============================================================
# IN-MEMORY EVENT STORAGE (works without Supabase)
# ============================================================
class EventStore:
    def __init__(self, max_events=1000):
        self.events = []
        self.max_events = max_events
        self.lock = threading.Lock()

    def add_event(self, event_data):
        with self.lock:
            event_data['timestamp'] = datetime.now().isoformat()
            self.events.append(event_data)
            if len(self.events) > self.max_events:
                self.events.pop(0)

    def get_events(self, limit=50):
        with self.lock:
            return list(reversed(self.events[-limit:]))

    def get_analytics(self, hours=24):
        """Calculate analytics from stored events"""
        with self.lock:
            cutoff = datetime.now() - timedelta(hours=hours)
            recent_events = [
                e for e in self.events
                if datetime.fromisoformat(e.get('timestamp', '')) > cutoff
            ]

            if not recent_events:
                return {
                    "total_events": 0,
                    "avg_traffic_score": 0,
                    "avg_car_count": 0,
                    "signal_distribution": {},
                    "hourly_traffic": [],
                    "peak_hours": [],
                    "override_count": 0
                }

            # Calculate metrics
            total_score = sum(e.get('traffic_score', 0) for e in recent_events)
            total_cars = sum(e.get('car_count', 0) for e in recent_events)
            override_count = sum(1 for e in recent_events if e.get('is_override', False))

            # Signal distribution
            signal_counts = defaultdict(int)
            for e in recent_events:
                signal_counts[e.get('signal', 'UNKNOWN')] += 1

            # Hourly traffic
            hourly = defaultdict(lambda: {"count": 0, "cars": 0, "score": 0})
            for e in recent_events:
                try:
                    ts = datetime.fromisoformat(e.get('timestamp', ''))
                    hour = ts.hour
                    hourly[hour]["count"] += 1
                    hourly[hour]["cars"] += e.get('car_count', 0)
                    hourly[hour]["score"] += e.get('traffic_score', 0)
                except:
                    pass

            hourly_list = [
                {
                    "hour": h,
                    "count": hourly[h]["count"],
                    "avg_cars": hourly[h]["cars"] / hourly[h]["count"] if hourly[h]["count"] > 0 else 0,
                    "avg_score": hourly[h]["score"] / hourly[h]["count"] if hourly[h]["count"] > 0 else 0
                }
                for h in sorted(hourly.keys())
            ]

            # Peak hours (top 3 by traffic count)
            peak = sorted(hourly.items(), key=lambda x: x[1]["count"], reverse=True)[:3]

            return {
                "total_events": len(recent_events),
                "avg_traffic_score": round(total_score / len(recent_events), 2),
                "avg_car_count": round(total_cars / len(recent_events), 1),
                "signal_distribution": dict(signal_counts),
                "hourly_traffic": hourly_list,
                "peak_hours": [{"hour": h, "count": v["count"]} for h, v in peak],
                "override_count": override_count
            }

    def clear_all(self):
        with self.lock:
            self.events.clear()

# Global event store
event_store = EventStore()

# ============================================================
# ROUTES
# ============================================================

@app.route("/override", methods=["POST"])
def override():
    """
    Set manual override
    Body: {"signal": "RED|YELLOW|GREEN", "speed_limit": 20|30|40|60|80}
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No body provided"}), 400

        signal = data.get("signal")
        speed_limit = data.get("speed_limit")

        if not signal or not speed_limit:
            return jsonify({"error": "Missing signal or speed_limit"}), 400

        # Validate
        signal = signal.upper()
        if signal not in ["RED", "YELLOW", "GREEN"]:
            return jsonify({"error": "Invalid signal"}), 400

        if speed_limit not in [20, 30, 40, 60, 80]:
            return jsonify({"error": "Invalid speed_limit"}), 400

        set_override(signal, speed_limit)

        # Log override event
        event_store.add_event({
            "type": "override",
            "signal": signal,
            "speed_limit": speed_limit,
            "is_override": True
        })

        return jsonify({
            "status": "ok",
            "signal": signal,
            "speed_limit": speed_limit
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/clear_override", methods=["POST"])
def clear_override_route():
    """Clear manual override"""
    try:
        clear_override()

        # Log event
        event_store.add_event({
            "type": "override_cleared",
            "is_override": False
        })

        return jsonify({"status": "ok", "message": "Override cleared"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/status", methods=["GET"])
def status():
    """
    Get current system state
    Returns: JSON with current signal, sensors, car_count, etc.
    """
    try:
        state = get_system_state()
        return jsonify(state), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/events", methods=["GET"])
def events():
    """
    Get recent traffic events
    Query params: limit (default 50)
    """
    try:
        limit = int(request.args.get('limit', 50))
        limit = min(limit, 200)  # Cap at 200

        events_list = event_store.get_events(limit)

        return jsonify({
            "events": events_list,
            "count": len(events_list)
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/analytics", methods=["GET"])
def analytics():
    """
    Get traffic analytics
    Query params: hours (default 24)
    Returns aggregated statistics
    """
    try:
        hours = int(request.args.get('hours', 24))
        hours = min(hours, 168)  # Max 7 days

        stats = event_store.get_analytics(hours)

        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/clear-logs", methods=["DELETE", "POST"])
def clear_logs():
    """Clear all event logs"""
    try:
        event_store.clear_all()
        return jsonify({"status": "ok", "message": "Logs cleared"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "events_stored": len(event_store.events)
    }), 200


@app.route("/metrics", methods=["GET"])
def metrics():
    """
    Get detailed metrics for dashboard
    Includes current state plus aggregated analytics
    """
    try:
        state = get_system_state()
        stats = event_store.get_analytics(hours=1)  # Last hour

        return jsonify({
            "current": state,
            "analytics": stats,
            "timestamp": datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ============================================================
# HELPER FUNCTION FOR MAIN.PY
# ============================================================

def log_traffic_event(car_count, queue_level, traffic_score, signal, speed_limit, is_override=False):
    """
    Log traffic event to in-memory store
    Call this from main.py after each decision
    """
    event_store.add_event({
        "type": "traffic_decision",
        "car_count": car_count,
        "queue_level": queue_level,
        "traffic_score": traffic_score,
        "signal": signal,
        "speed_limit": speed_limit,
        "is_override": is_override
    })


def run_api_server():
    """Run Flask API server"""
    from config import FLASK_HOST, FLASK_PORT
    print(f"Starting Enhanced Flask API server on {FLASK_HOST}:{FLASK_PORT}")
    print(f"Available endpoints:")
    print(f"  GET  /status     - Current system state")
    print(f"  GET  /events     - Recent traffic events")
    print(f"  GET  /analytics  - Traffic analytics")
    print(f"  GET  /metrics    - Combined metrics")
    print(f"  POST /override   - Set manual override")
    print(f"  POST /clear_override - Clear override")
    print(f"  GET  /health     - Health check")
    app.run(host=FLASK_HOST, port=FLASK_PORT, threaded=True, use_reloader=False)


if __name__ == "__main__":
    run_api_server()
