import os
from flask import Flask, request, jsonify, render_template
import requests
from dotenv import load_dotenv

load_dotenv()

# Flask 애플리케이션 초기화
app = Flask(__name__)

# 환경 변수로부터 백엔드 URL 가져오기
app.config['BACKEND_URL'] = os.getenv('BACKEND_URL')

# 모든 템플릿에서 backend_url을 사용할 수 있도록 설정
@app.context_processor
def inject_backend_url():
    return dict(backend_url=app.config['BACKEND_URL'])

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/learning-order')
def learning_order():
    return render_template('learning-order.html')

@app.route('/learning-level')
def learning_level():
    return render_template('learning-level.html')

@app.route('/learning-quantity')
def learning_quantity():
    return render_template('learning-quantity.html')

@app.route('/learning-content')
def learning_content():
    return render_template('learning-content.html')

@app.route('/quiz')
def quiz():
    return render_template('quiz.html')

@app.route('/feedback')
def feedback():
    return render_template('feedback.html')

@app.route('/quiz-result')
def quiz_result():
    return render_template('quiz-result.html')

@app.route('/shadowing')
def shadowing():
    return render_template('shadowing.html')

@app.route('/end-quiz')
def end_quiz():
    return render_template('end-quiz.html')

@app.route('/end-shadowing')
def end_shadowing():
    return render_template('end-shadowing.html')

@app.route('/end-learning')
def end_learning():
    return render_template('end-learning.html')

# 백엔드 API와 연동
@app.route('/api/forward', methods=['POST'])
def forward_to_backend(): 
    backend_url = app.config['BACKEND_URL']
    data = request.json  # 요청 데이터 가져오기
    try:
        response = requests.post(f"{backend_url}/api/endpoint", json=data)  
        return jsonify(response.json()), response.status_code  
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500

# Flask 애플리케이션 실행
if __name__ == '__main__':
    # 환경 변수 PORT를 우선적으로 사용하고, 없으면 기본값으로 3000 사용
    port = int(os.getenv('PORT', 3000))
    app.run(host='0.0.0.0', port=port, debug=True)
