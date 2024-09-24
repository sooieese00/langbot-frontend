import os
from flask import Flask, request, jsonify, render_template
import requests

# Flask 애플리케이션 초기화
app = Flask(__name__)

# 기본 페이지 라우트
@app.route('/')
def index():
    return render_template('index.html')  # index.html 템플릿 렌더링

# 학습 순서 선택 페이지 라우트
@app.route('/learning-order')
def learning_order():
    return render_template('learning-order.html')  # learning-order.html 템플릿 렌더링

# 학습 난이도 설정 페이지 라우트
@app.route('/learning-level')
def learning_level():
    return render_template('learning-level.html')  # learning-level.html 템플릿 렌더링

# 학습 어휘/구문 개수 설정 페이지 라우트
@app.route('/learning-quantity')
def learning_quantity():
    return render_template('learning-quantity.html')  # learning-quantity.html 템플릿 렌더링

# 학습 내용 페이지 라우트
@app.route('/learning-content')
def learning_content():
    return render_template('learning-content.html')  # learning-content.html 템플릿 렌더링


# 퀴즈 및 피드백
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

# 백엔드 API와 연동하는 예제 엔드포인트
@app.route('/api/forward', methods=['POST'])
def forward_to_backend():
    backend_url = 'http://localhost:5000'  # 백엔드 URL
    data = request.json  # 요청 데이터 가져오기
    try:
        response = requests.post(backend_url, json=data)  # 백엔드에 POST 요청 보내기
        return jsonify(response.json()), response.status_code  # 백엔드 응답 반환
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500  # 요청 예외 발생 시 에러 반환

# Flask 애플리케이션 실행
if __name__ == '__main__':
    app.run(port=3000, debug=True)