"""
Supabase Client - Database Operations
"""

from supabase import create_client, Client
from datetime import datetime
from config import SUPABASE_URL, SUPABASE_KEY, TUNNEL_URL

# Initialize Supabase client
_supabase: Client = None


def get_supabase():
    """Get or create Supabase client"""
    global _supabase
    if _supabase is None:
        if not SUPABASE_URL or not SUPABASE_KEY:
            print("Warning: SUPABASE_URL or SUPABASE_KEY not set")
            return None
        _supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _supabase


def log_event(car_count, queue_level, traffic_score, signal, speed_limit, is_override=False):
    """
    Log traffic event to Supabase
    Args:
        car_count: int - number of vehicles detected
        queue_level: int - queue level (0-6)
        traffic_score: float - computed traffic score
        signal: str - traffic signal state
        speed_limit: int - speed limit
        is_override: bool - whether this was an override decision
    """
    try:
        supabase = get_supabase()
        if supabase is None:
            return

        supabase.table("traffic_events").insert({
            "car_count": car_count,
            "queue_level": queue_level,
            "traffic_score": traffic_score,
            "signal": signal,
            "speed_limit": speed_limit,
            "is_override": is_override
        }).execute()

        print(f"Logged event: cars={car_count}, queue={queue_level}, score={traffic_score:.2f}, signal={signal}")

    except Exception as e:
        print(f"Error logging to Supabase: {e}")


def update_heartbeat():
    """Update heartbeat in system_state table"""
    try:
        supabase = get_supabase()
        if supabase is None:
            return

        timestamp = datetime.utcnow().isoformat()
        supabase.table("system_state").upsert({
            "key": "heartbeat",
            "value": timestamp,
            "updated_at": timestamp
        }).execute()

    except Exception as e:
        print(f"Error updating heartbeat: {e}")


def update_tunnel_url(url):
    """Update tunnel URL in system_state table"""
    try:
        supabase = get_supabase()
        if supabase is None:
            return

        supabase.table("system_state").upsert({
            "key": "tunnel_url",
            "value": url,
            "updated_at": datetime.utcnow().isoformat()
        }).execute()

        print(f"Updated tunnel_url: {url}")

    except Exception as e:
        print(f"Error updating tunnel URL: {e}")


def get_recent_events(limit=50):
    """
    Get recent traffic events from Supabase
    Args:
        limit: int - number of events to fetch
    Returns:
        list: traffic events
    """
    try:
        supabase = get_supabase()
        if supabase is None:
            return []

        result = supabase.table("traffic_events") \
            .select("*") \
            .order("created_at", desc=True) \
            .limit(limit) \
            .execute()

        return result.data

    except Exception as e:
        print(f"Error fetching events: {e}")
        return []


def get_system_state_from_db():
    """
    Get system state from Supabase (for dashboard)
    Returns:
        dict: system state including heartbeat and tunnel_url
    """
    try:
        supabase = get_supabase()
        if supabase is None:
            return {}

        result = supabase.table("system_state") \
            .select("*") \
            .execute()

        state = {}
        for row in result.data:
            state[row["key"]] = row["value"]

        return state

    except Exception as e:
        print(f"Error fetching system state: {e}")
        return {}


if __name__ == "__main__":
    # Test database operations
    print("Testing Supabase client...")

    # Test logging event
    log_event(5, 2, 4.5, "GREEN", 60, False)

    # Test heartbeat
    update_heartbeat()

    # Test fetch events
    events = get_recent_events(5)
    print(f"Recent events: {len(events)}")
