"""
Orbyte Smart Payment Follow-up AI - Server Launcher
"""
import sys
import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
sys.path.insert(0, BASE_DIR)

from backend.app import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print("=" * 60)
    print("  Orbyte Smart Payment Follow-up AI - Local Host Deploy")
    print(f"  Live URL: http://localhost:{port}")
    print("  Architecture: 3D Voxel Campus + 7 AI Production Agents")
    print("  Safety: Strict Financial Determinism + Pydantic + HITL")
    print("=" * 60)
    app.run(host="0.0.0.0", port=port, debug=False)
