"""
AI News Mailer
毎日2回（朝8時・夜20時 JST）、AI最新情報をメールで送信するスクリプト
"""

import os
import smtplib
import json
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import anthropic

# ── 設定 ──────────────────────────────────────────────
ANTHROPIC_API_KEY = os.environ["ANTHROPIC_API_KEY"]
GMAIL_USER        = os.environ["GMAIL_USER"]        # 送信元 Gmail アドレス
GMAIL_APP_PASSWORD = os.environ["GMAIL_APP_PASSWORD"]  # Gmail アプリパスワード
RECIPIENT_EMAIL   = os.environ["RECIPIENT_EMAIL"]   # 受信先メールアドレス
# ──────────────────────────────────────────────────────

CATEGORIES = [
    {
        "id": "news",
        "label": "📰 最新ニュース・リリース",
        "query": "今日のAI・人工知能の最新ニュースとリリース情報を日本語で5件教えてください。各項目に概要と重要度（高/中/低）を付けてください。",
    },
    {
        "id": "research",
        "label": "🔬 論文・研究トピック",
        "query": "今週発表された注目のAI・機械学習論文を3件教えてください。タイトル・著者・要点を日本語でまとめてください。",
    },
    {
        "id": "companies",
        "label": "🏢 企業動向（OpenAI / Anthropic / NVIDIA等）",
        "query": "OpenAI、Anthropic、Google DeepMind、Meta AI、NVIDIAの最新動向・発表・ビジネスニュースを日本語で教えてください。",
    },
    {
        "id": "trends",
        "label": "📈 SNS・トレンド情報",
        "query": "AI分野でいま話題になっているトレンド・バズワード・注目テーマをSNS（X/Twitter、Reddit等）の動向も含めて日本語で教えてください。",
    },
]


def fetch_ai_news(category: dict) -> str:
    """Claude API（Web検索付き）でAI情報を取得する"""
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1000,
        tools=[{"type": "web_search_20250305", "name": "web_search"}],
        messages=[{"role": "user", "content": category["query"]}],
    )

    # テキストブロックを結合して返す
    full_text = ""
    for block in response.content:
        if block.type == "text":
            full_text += block.text
    return full_text.strip() or "情報を取得できませんでした。"


def build_html_email(sections: list[dict]) -> str:
    """HTML形式のメール本文を生成する"""
    now = datetime.now().strftime("%Y年%m月%d日 %H:%M")
    slot = "朝" if datetime.now().hour < 14 else "夜"

    items_html = ""
    for sec in sections:
        # マークダウン風の改行をHTMLに変換（簡易）
        body = sec["content"].replace("\n", "<br>")
        items_html += f"""
        <div style="margin-bottom:28px;">
          <h2 style="font-size:16px;font-weight:600;color:#1a1a2e;
                     border-left:4px solid #7c3aed;padding-left:12px;margin:0 0 12px;">
            {sec['label']}
          </h2>
          <div style="font-size:14px;line-height:1.8;color:#374151;">
            {body}
          </div>
        </div>
        """

    return f"""
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="600" cellpadding="0" cellspacing="0"
             style="background:#ffffff;border-radius:12px;overflow:hidden;
                    box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <!-- ヘッダー -->
        <tr>
          <td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);
                     padding:28px 32px;color:#fff;">
            <div style="font-size:11px;letter-spacing:2px;opacity:0.8;margin-bottom:6px;">
              AI ECOSYSTEM DIGEST
            </div>
            <div style="font-size:22px;font-weight:700;margin-bottom:4px;">
              {slot}のAI情報まとめ
            </div>
            <div style="font-size:13px;opacity:0.75;">{now} 配信</div>
          </td>
        </tr>

        <!-- 本文 -->
        <tr>
          <td style="padding:32px;">
            {items_html}
          </td>
        </tr>

        <!-- フッター -->
        <tr>
          <td style="background:#f9fafb;padding:20px 32px;
                     border-top:1px solid #e5e7eb;text-align:center;">
            <div style="font-size:12px;color:#9ca3af;">
              このメールはAI News Mailerによって自動送信されました<br>
              Powered by Claude + Web Search
            </div>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
"""


def send_email(html_body: str, subject: str):
    """GmailのSMTPでメールを送信する"""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = GMAIL_USER
    msg["To"]      = RECIPIENT_EMAIL
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
        server.sendmail(GMAIL_USER, RECIPIENT_EMAIL, msg.as_string())
    print(f"✅ メール送信完了 → {RECIPIENT_EMAIL}")


def main():
    print(f"[{datetime.now().isoformat()}] AI情報収集を開始します...")

    sections = []
    for cat in CATEGORIES:
        print(f"  取得中: {cat['label']}")
        content = fetch_ai_news(cat)
        sections.append({"label": cat["label"], "content": content})

    slot = "朝" if datetime.now().hour < 14 else "夜"
    date_str = datetime.now().strftime("%m/%d")
    subject = f"【AI情報】{date_str} {slot}のダイジェスト"

    html = build_html_email(sections)
    send_email(html, subject)
    print("🎉 完了！")


if __name__ == "__main__":
    main()
