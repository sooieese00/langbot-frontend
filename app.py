import os
from flask import Flask, request, jsonify, render_template
import requests

# Flask 애플리케이션 초기화
app = Flask(__name__)


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