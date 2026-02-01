import os
import sys
import httpx
import argparse
from dotenv import load_dotenv

# Load Environment Variables
# Try to find .env file
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
env_path = os.path.join(backend_dir, '.env')
frontend_env_path = os.path.join(os.path.dirname(backend_dir), 'frontend', '.env.local')

load_dotenv(env_path)
load_dotenv(frontend_env_path) # Load frontend env too for URL

# Configuration
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SERVICE_KEY:
    print("Error: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")
    sys.exit(1)

# Minimal Supabase Client (Copied from main.py pattern)
class SupabaseClient:
    def __init__(self, url: str, key: str):
        self.url = url.rstrip('/')
        self.key = key
        self.headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

    def table(self, name: str):
        return SupabaseQueryBuilder(self.url, self.headers, name)

class SupabaseQueryBuilder:
    def __init__(self, base_url, headers, table_name):
        self.table_url = f"{base_url}/rest/v1/{table_name}"
        self.headers = headers
        self.query_params = {}
        self.json_data = None
        self.method = "GET"

    def select(self, columns="*"):
        self.method = "GET"
        self.query_params["select"] = columns
        return self

    def eq(self, column: str, value: str):
        self.query_params[f"{column}"] = f"eq.{value}"
        return self

    def update(self, data: dict):
        self.method = "PATCH"
        self.json_data = data
        return self

    def execute(self):
        with httpx.Client() as client:
            if self.method == "PATCH":
                response = client.patch(self.table_url, headers=self.headers, json=self.json_data, params=self.query_params)
            elif self.method == "GET":
                response = client.get(self.table_url, headers=self.headers, params=self.query_params)
            else:
                raise Exception("Method not supported in this script")
            
            if response.status_code >= 400:
                print(f"API Error: {response.text}")
                response.raise_for_status()
            
            return response.json()

# Main Logic
def promote_user(email):
    client = SupabaseClient(SUPABASE_URL, SERVICE_KEY)
    
    print(f"Finding user with email: {email}...")
    
    # 1. Check if user exists in profiles
    users = client.table("profiles").select("*").eq("email", email).execute()
    
    if not users:
        print(f"Error: No user found with email '{email}' in 'profiles' table.")
        print("Please ensure the user has registered via the website first.")
        return

    user = users[0]
    print(f"Found user: {user.get('full_name', 'Unknown')} (ID: {user['id']})")
    print(f"Current Role: {user.get('role')}")
    
    # 2. Update role
    if user.get('role') == 'admin':
        print("User is already an Admin.")
        return

    print("Promoting to Admin...")
    updated = client.table("profiles").update({"role": "admin"}).eq("id", user['id']).execute()
    
    print("Success! User is now an Admin.")

def demote_user(email):
    client = SupabaseClient(SUPABASE_URL, SERVICE_KEY)
    # Similar logic... validation omitted for brevity
    client.table("profiles").update({"role": "student"}).eq("email", email).execute()
    print(f"User {email} demoted to Student.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Manage World One Users")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Promote Command
    promote_parser = subparsers.add_parser("promote", help="Promote a user to Admin")
    promote_parser.add_argument("email", help="Email of the user to promote")

    # Demote Command
    demote_parser = subparsers.add_parser("demote", help="Demote a user to Student")
    demote_parser.add_argument("email", help="Email of the user to demote")

    args = parser.parse_args()

    try:
        if args.command == "promote":
            promote_user(args.email)
        elif args.command == "demote":
            demote_user(args.email)
    except Exception as e:
        print(f"An error occurred: {e}")
