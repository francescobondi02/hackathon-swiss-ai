from flask import Flask, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'success',
        'message': 'Backend is running!',
        'data': {
            'server': 'Python Flask',
            'version': '1.0.0'
        }
    })

@app.route('/api/test-connection', methods=['GET'])
def test_connection():
    return jsonify({
        'status': 'success',
        'message': 'Connection successful!',
        'timestamp': '2025-01-11T12:00:00Z',
        'backend_info': {
            'language': 'Python',
            'framework': 'Flask',
            'cors_enabled': True
        }
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)