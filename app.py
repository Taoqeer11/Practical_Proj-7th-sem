from flask import Flask, render_template, request
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# -------------------------------
# CONFIG
# -------------------------------
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL_NAME = "llama-3.1-8b-instant"

# -------------------------------
# AI TUTOR FUNCTION
# -------------------------------
def ask_ai(user_question):
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL_NAME,
        "messages": [
            {
                "role": "system",
                "content": "You are an AI mentor that explains Programming, DBMS, and OS concepts clearly with examples."
            },
            {
                "role": "user",
                "content": user_question
            }
        ],
        "temperature": 0.5
    }

    try:
        response = requests.post(GROQ_URL, headers=headers, json=payload, timeout=30)
        data = response.json()

        # DEBUG (visible in terminal)
        print("Groq Tutor Response:", data)

        if "choices" in data:
            return data["choices"][0]["message"]["content"]

        if "error" in data:
            return f"Groq API Error: {data['error']['message']}"

        return "Unexpected response from AI tutor."

    except Exception as e:
        return f"AI Tutor Exception: {str(e)}"

# -------------------------------
# QUIZ GENERATOR FUNCTION
# -------------------------------
def generate_quiz(topic):
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    quiz_prompt = f"""
    Generate 5 multiple choice questions (MCQs) on "{topic}".
    Each question should have 4 options (A, B, C, D)
    and clearly mention the correct answer.
    """

    payload = {
        "model": MODEL_NAME,
        "messages": [
            {
                "role": "system",
                "content": "You are an AI system that generates quizzes for students."
            },
            {
                "role": "user",
                "content": quiz_prompt
            }
        ],
        "temperature": 0.7
    }

    try:
        response = requests.post(GROQ_URL, headers=headers, json=payload, timeout=30)
        data = response.json()

        # DEBUG
        print("Groq Quiz Response:", data)

        if "choices" in data:
            return data["choices"][0]["message"]["content"]

        if "error" in data:
            return f"Groq API Error: {data['error']['message']}"

        return "Unexpected response from quiz generator."

    except Exception as e:
        return f"Quiz Generator Exception: {str(e)}"

# -------------------------------
# ROUTES
# -------------------------------
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/diagnostic", methods=["GET", "POST"])
def diagnostic():
    if request.method == "POST":
        score = int(request.form["score"])

        if score < 50:
            level = "Weak"
        elif score < 75:
            level = "Average"
        else:
            level = "Strong"

        return render_template("dashboard.html", level=level)

    return render_template("diagnostic.html")

@app.route("/tutor", methods=["GET", "POST"])
def tutor():
    response = ""
    if request.method == "POST":
        question = request.form["question"]
        response = ask_ai(question)

    return render_template("tutor.html", response=response)

@app.route("/quiz", methods=["GET", "POST"])
def quiz():
    quiz_data = ""
    if request.method == "POST":
        topic = request.form["topic"]
        quiz_data = generate_quiz(topic)

    return render_template("quiz.html", quiz=quiz_data)

# -------------------------------
# MAIN
# -------------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
