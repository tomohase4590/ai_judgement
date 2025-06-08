GOOGLE_API_KEY = "your_google_api_key_here"  # Google APIキーをここに設定
from flask import Flask,jsonify, render_template, request, redirect, url_for, session
from flask_socketio import SocketIO 
from flask_cors import CORS
from flask_session import Session
import google.generativeai as genai
import markdown
import uuid
import os
import re
# Flaskアプリの初期化
app = Flask(__name__)
app.config['SESSION_TYPE'] = 'filesystem'  # セッションデータをファイルに保存
app.config['SESSION_FILE_DIR'] = "sessions"
  # セッションファイルの保存先ディレクトリ
app.config['SESSION_PERMANENT'] = False  # セッションが永続的でないように設定（オプション）
app.config['SESSION_USE_SIGNER'] = True
app.config['SECRET_KEY'] = 'secret!'
Session(app)
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app, resources={r"/*": {"origins": "*"}})
genai.configure(api_key=GOOGLE_API_KEY)  # 実際のAPIキーを設定
model = genai.GenerativeModel('gemini-2.0-flash')
# グローバル変数でモードデータを保持
modes = ["AI同士", "AIと人", "人と人"]
generation_config = {
    "temperature": 0.9,  # 生成するテキストのランダム性を制御
    "top_p": 1,          # 生成に使用するトークンの累積確率を制御
    "top_k": 1,          # 生成に使用するトップkトークンを制御
    "max_output_tokens": 5,  # 最大出力トークン数を指定`
   }

# サンプルデータ: ジャンルとテーマ候補
genre_theme_map = {
    "社会": ["働き方改革", "人口減少の影響", "ジェンダー平等"],
    "テクノロジー": ["AIの未来", "量子コンピュータの応用", "メタバースの課題"],
    "エンターテインメント": ["映画のストリーミングサービス", "音楽業界の変化", "ゲームと教育"],
    "教育": ["オンライン学習のメリットとデメリット", "学校のカリキュラム改革", "教育格差の解消"],
    "スポーツ": ["スポーツマンシップの重要性", "eスポーツの普及", "オリンピックの経済効果"]
}
# 追加したインデックスページ
@app.route('/')
def index():
    # return redirect(url_for('mode'))  # 最初にモード選択画面へリダイレクト
    session.clear()

    return render_template('index.html')



@app.route('/人vs人')
def 人vs人():
    return render_template('人theme.html')

@app.route('/index')
def index1():
    return render_template('index.html')

@app.route('/AIvsAI')
def AIvsAI():
    return render_template('AIvsAI.html')

@app.route('/get-themes', methods=['POST'])
def get_themes():
    genre = request.json.get('genre')
    themes = genre_theme_map.get(genre, [])
    return jsonify(themes)


@app.route('/AIvs人', methods=['GET', 'POST'])
def AIvs人():
    genres = list(genre_theme_map.keys()) 
    return render_template('theme.html', genres=genres)

@app.route('/theme', methods=['GET', 'POST'])
def theme_selection():
    if request.method == 'POST':
        
        # ジャンル、テーマ、ポジションもセッションに保存
        genre = request.form.get('genre')
        theme = request.form.get('theme')
        position1 = request.form.get('position1')
        position2 = request.form.get('position2')
        
        # セッションにジャンル、テーマ、ポジションを保存
        session["genre"] = genre
        session["theme"] = theme
        session["position1"] = position1
        session["position2"] = position2

    return render_template('theme.html', genres=list(genre_theme_map.keys()))


@app.route('/start-debate', methods=['POST'])
def start_debate():
    # フォームからデータを取得
    genre = request.form.get('genre', '未選択')
    theme = request.form.get('theme', '未入力')
    position1 = request.form.get('position1', '賛成')
    position2 = request.form.get('position2', '反対')

    # セッションにデータを保存
    session['genre'] = genre
    session['theme'] = theme
    session['position1'] = position1
    session['position2'] = position2

    # ルームIDを作成
    room_id = str(uuid.uuid4())
    session['room'] = room_id
    session['mode'] = "AIと人"
    return redirect('/chat')


@app.route('/chat', methods=['GET', 'POST'])
def chat():
    # if 'theme' not in session or 'mode' not in session:
    #     return redirect('/')
    theme = session.get('theme', 'デフォルトテーマ')
    mode = session['mode']
    room_id = session['room']
    position1 = session['position1']
    position2 = session['position2']
    user_message = request.form.get('user_message')
    result = ""
    judgment = ""
    judge_result =""
    # print(session)
    # print(human_icon_id, ai_icon_id,ai_icon_path, user_icon_path)
    # セッションからメッセージ履歴を取得（初回は空のリスト）
    messages = session.get(f'messages_{room_id}', [])

    if request.method == 'POST':
        if 'clear_history' in request.form:
            # 履歴削除リクエスト
            session[f'messages_{room_id}'] = []  # 部屋ごとに履歴をリセット
            messages = []

        elif 'home' in request.form:
            return render_template('index.html')
        elif 'judge' in request.form:
            ai_response = get_ai_judgment(messages)
            ai_response_html = ai_response[0]
            judge_result = ai_response[0]
            print(judge_result)
            # print(ai_response[1])
            result = "<script>window.addEventListener('DOMContentLoaded', function() { changeresult(); });</script>"

            judgment = ai_response[1]
            messages.append({"role": "system", "content": ai_response_html})
            session[f'messages_{room_id}'] = messages


        else:
            if 'user_message' in request.form:
                user_message = request.form.get('user_message')
                print(f"Form Data: {request.form}")
                print(f"Form Data: {request.form.getlist('user_message')}")
                print(f"Session Messages: {session.get(f'messages_{room_id}', [])}")
                # メッセージ履歴にユーザーのメッセージを追加
                messages.append({"role": "User", "content": user_message})
                session[f'messages_{room_id}'] = messages  # 部屋ごとに保存
        
                ai_response = get_ai_response(theme, user_message, position1)
                messages.append({"role": "AI", "content": ai_response})
                session[f'messages_{room_id}'] = messages                # pass
            
            # else:
            #     messages.append({"role": "User", "content": user_message})

    return render_template('chat.html', theme=theme, mode=mode,position1=position1,position2=position2, messages=messages,judge_result=judge_result, judgment=judgment,result= result) 




def get_ai_judgment(messages):
    # メッセージ履歴を整理して、AIに渡す形式に変換
    formatted_messages = "\n".join([f"{msg['role']}: {msg['content']}" for msg in messages])
    
    # プロンプト作成: メッセージ履歴を評価して、優れた意見がどちらかを選ぶ
    prompt = f"次のメッセージを読んで、どちらの意見が優れているかを選んでください。\n{formatted_messages}\n優れているほうを「人」または「AI」として答えてください。"
    
    # AIによる判断（どちらが優れているか）
    response = model.generate_content(prompt)  # 修正: generate -> text
    judgment = response.text.strip()  # 「人」または「AI」の選択結果
    print(judgment)
    # 次に、選ばれた意見がなぜ優れているかを具体的に説明
    reason_prompt = f"次の選ばれた意見がなぜ優れているかを具体的に説明してください。\n選ばれた意見: {judgment}\n{formatted_messages}"
    
    # AIによる理由の説明
    reason_response = model.generate_content(reason_prompt)  # 修正: generate -> text
    reason = reason_response.text.strip()  # 優れた意見の理由

    # 改行を<br>に変換
    reason = reason.replace('\n', '<br>')
    
    # 判定結果と理由をHTMLとして返す
    ai_message_html = f"**判定結果**: {judgment}<br><br>**理由**: {reason}"
    
    return ai_message_html, judgment



def get_ai_response(theme, last_message, position):
    # AIがユーザーに応答する
    if last_message and last_message != "first_message":  # last_messageがNoneでない場合のみ処理
        if last_message.startswith("AI1") or last_message.startswith("system"):
            prompt = f"テーマ「{theme}」について、{position}の立場で補足や追加の簡潔で短く意見を言ってください。 "
        else:
            prompt = f"テーマ「{theme}」について、以下の意見に対する反論を簡潔で短く述べてください:\n{last_message} "
    else:
        prompt = f"テーマ「{theme}」について、{position}の立場で簡潔で短い意見を言ってください。"
    
    response = model.generate_content(prompt, generation_config=genai.GenerationConfig(max_output_tokens=700))
    ai_message = response.text
    ai_message_html = markdown.markdown(ai_message)
    return ai_message_html


def generate_ai_message(theme, position,room_id):
    # セッションから現在のメッセージ履歴を取得（すべての履歴を取得）
    messages = session.get(f'messages_{room_id}', [])
    
    # 最新のMAX_HISTORY件のみを参照用に取得
    # messages.append({"role": "system", "content": f"テーマ: {theme}"})
    ai_prompt = f"「{theme}」について、{position}の立場で簡潔に意見を述べてください。今までの発言: {messages}"
    response = model.generate_content(ai_prompt)

    ai_message = response.text
    ai_message_html = markdown.markdown(ai_message)
    return ai_message_html


@app.route("/api/judge", methods=["GET", "POST"])
def judge():
    # フォームデータから debateData[] を取得
    print(request.form) 
    topic = request.form.get("topic")
    debate_list = request.form.getlist("debateData[]")

    # if len(debate_list) % 2 != 0:
    #     return jsonify({"error": "無効なデータ形式です"}), 400

    # left / right に分類
    debate_data = {"left": [], "right": []}
    for i in range(0, len(debate_list), 2):
        sender, text = debate_list[i], debate_list[i + 1]
        if sender == "left":
            debate_data["left"].append(text)
        elif sender == "right":
            debate_data["right"].append(text)

    # 両方の意見がない場合はエラー
    if not debate_data["left"] or not debate_data["right"]:
        return jsonify({"error": "両方の意見が必要です"}), 400

    # **プロンプト作成**
    left_text = "\n".join([f"左側: {text}" for text in debate_data["left"]])
    right_text = "\n".join([f"右側: {text}" for text in debate_data["right"]])

    prompt = f"""
    以下のディベートを分析し、どちらの意見がより論理的で説得力があるかを判定してください。
    以下のフォーマットを守ること。内容が立りなくても付け足さないようにしてください。

    【ディベート内容】
    {topic}
    {left_text}
    {right_text}

    **判定フォーマット**
    - **勝者**: （左側 or 右側 スコアが高いほうが勝者）
    - **スコア**: 0-0（合計100 点数とハイフンのみで）
    - **理由**: 判定の根拠を2つ列挙する
        1. 
        2.
    - **ハイライト**: 各意見の強いポイントを列挙
        - **左側**:
        - **右側**:
    """

    # **AI にリクエスト**
    response = model.generate_content(prompt)
    ai_result = response.text

    winner_match = re.search(r"勝者[^\n]*: (\S+)", ai_result)
    winner = "right" if winner_match and "右" in winner_match.group(1) else "left"

    # 2. スコアの抽出
    scores_match = re.search(r"スコア[^\n]*: (\d+)-(\d+)", ai_result)
    scores = {
        "left": int(scores_match.group(1)),
        "right": int(scores_match.group(2))
    } if scores_match else None

    # 3. 理由の抽出
    reasons = []
    reasons_match = re.search(r"- \*\*理由\*\*:(.*?)(?=\n\s*- \*\*ハイライト\*\*:|$)", ai_result, re.DOTALL)
    if reasons_match:
        reasons_text = reasons_match.group(1).strip()
        reasons = [re.sub(r"^\s*\d+\.\s*", "", line.strip()) for line in reasons_text.split("\n") if line.strip()]


    # 4. ハイライトの抽出
    highlights = {"left": [], "right": []}

    # ハイライト部分を抽出
    highlights_match = re.search(r"- \*\*ハイライト\*\*:(.*?)$", ai_result, re.DOTALL)
    if highlights_match:
        highlights_text = highlights_match.group(1).strip()

        # 左側と右側のハイライトを抽出
        # 左側の部分
        left_highlights_match = re.search(r"- \*\*左側\*\*:\s*(.*?)(?=\n\s*- \*\*右側\*\*:|$)", highlights_text, re.DOTALL)
        if left_highlights_match:
            left_highlights = left_highlights_match.group(1).strip().split("\n")
            highlights["left"] = [line.strip() for line in left_highlights if line.strip()]

        # 右側の部分
        right_highlights_match = re.search(r"- \*\*右側\*\*:\s*(.*)$", highlights_text, re.DOTALL)
        if right_highlights_match:
            right_highlights = right_highlights_match.group(1).strip().split("\n")
            highlights["right"] = [line.strip() for line in right_highlights if line.strip()]




    # **最終レスポンス**
    result = {
        "winner": winner,
        "analysis": ai_result,
        "scores": scores,
        "reasons": reasons,
        "highlights": highlights
    }

    return jsonify(result)



if __name__ == '__main__':
    # socketio.run(app, debug=True)
    os.makedirs(app.config['SESSION_FILE_DIR'], exist_ok=True)  # フォルダがない場合に作成
    app.run(debug=True)

