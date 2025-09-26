#!/usr/bin/env python3
"""
Simple script to run the Flask backend server
"""
import subprocess
import sys
import os

def install_requirements():
    """Install required packages"""
    try:
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'])
        print("✅ Requirements installed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing requirements: {e}")
        return False
    return True

def run_server():
    """Run the Flask server"""
    try:
        print("🚀 Starting Flask backend server...")
        print("📍 Server will be available at: http://localhost:5000")
        print("🔗 API endpoints:")
        print("   - GET /api/health")
        print("   - GET /api/test-connection")
        print("\n💡 Press Ctrl+C to stop the server\n")
        
        subprocess.run([sys.executable, 'app.py'])
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Error running server: {e}")

if __name__ == '__main__':
    print("🔧 Setting up Python Flask backend...")
    
    if install_requirements():
        run_server()
    else:
        print("❌ Failed to install requirements. Please check your Python environment.")