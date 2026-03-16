

"""
AI News Mailer（無料版）
NewsAPI を使ってAI最新情報を収集し、毎日2回メールで送信するスクリプト
NewsAPI 無料プラン: https://newsapi.org/register
"""
 
import os
import smtplib
import urllib.request
import urllib.parse
import json
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
 
# ── 設定 ──────────────────────────────────────────────
NEWS_API_KEY      = os.environ["NEWS_API_KEY"]        # NewsAPI のキー（無料）
GMAIL_USER        = os.environ["GMAIL_USER"]          # 送信元 Gmail アドレス
GMAIL_APP_PASSWORD = os.environ["GMAIL_APP_PASSWORD"] # Gmail アプリパスワード
RECIPIENT_EMAIL   = os.environ["RECIPIENT_EMAIL"]     # 受信先メールアドレス
# ──────────────────────────────────────────────────────
 
# 収集するAI情報のキーワード設定
CATEGORIES = [
    {
        "label": "📰 AI最新ニュース",
        "query": "artificial intelligence AI",
        "color": "#7c3aed",
    },
    {
        "label": "🏢 企業動向（OpenAI / Anthropic / NVIDIA）",
        "query": "OpenAI OR Anthropic OR NVIDIA AI",
        "color": "#0969da",
    },
    {
        "label": "🔬 AI研究・論文",
        "query": "AI research machine learning LLM",
        "color": "#2da44e",
    },
    {
        "label": "📈 AIトレンド",
        "query": "AI trend generative AI ChatGPT",
        "color": "#e85d04",
    },
]
 
 
def fetch_news(query: str, max_articles: int = 5) -> list[dict]:
    """NewsAPI から記事を取得する"""
    yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    params = urllib.parse.urlencode({
        "q": query,
        "from": yesterday,
        "sortBy": "publishedAt",
        "language": "en",
        "pageSize": max_articles,
        "apiKey": NEWS_API_KEY,
    })
    url = f"https://newsapi.org/v2/everything?{params}"
    try:
        with urllib.request.urlopen(url, timeout=10) as res:
            data = json.loads(res.read().decode())
            return data.get("articles", [])
    except Exception as e:
        print(f"  ⚠️  NewsAPI エラー ({query}): {e}")
        return []
 
 
def format_article(article: dict) -> str:
    """記事をHTML形式に変換する"""
    title       = article.get("title", "タイトルなし")
    description = article.get("description") or ""
    url         = article.get("url", "#")
    source      = article.get("source", {}).get("name", "不明")
    published   = article.get("publishedAt", "")[:10]
 
    return f"""
    <div style="border-left: 3px solid #e5e7eb; padding: 8px 0 8px 14px; margin-bottom: 14px;">
      <a href="{url}" style="font-size:14px;font-weight:600;color:#1a1a2e;text-decoration:none;line-height:1.5;">
        {title}
      </a>
      <div style="font-size:12px;color:#6b7280;margin:3px 0 5px;">
        {source}　{published}
      </div>
      <div style="font-size:13px;color:#374151;line-height:1.6;">
        {description[:150] + "…" if len(description) > 150 else description}
      </div>
    </div>
    """
 
 
def build_html_email(sections: list[dict]) -> str:
    """HTML形式のメール本文を生成する"""
    now  = datetime.now().strftime("%Y年%m月%d日 %H:%M")
    slot = "朝" if datetime.now().hour < 14 else "夜"
 
    sections_html = ""
    for sec in sections:
        articles_html = "".join(format_article(a) for a in sec["articles"])
        if not articles_html:
            articles_html = '<p style="font-size:13px;color:#9ca3af;">記事を取得できませんでした</p>'
        sections_html += f"""
        <div style="margin-bottom:32px;">
          <h2 style="font-size:15px;font-weight:700;color:#fff;
                     background:{sec['color']};border-radius:6px;
                     padding:7px 14px;margin:0 0 14px;display:inline-block;">
            {sec['label']}
          </h2>
          {articles_html}
        </div>
        """
 
    return f"""<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="600" cellpadding="0" cellspacing="0"
             style="background:#fff;border-radius:12px;overflow:hidden;
                    box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:28px 32px;color:#fff;">
            <div style="font-size:11px;letter-spacing:2px;opacity:0.8;margin-bottom:6px;">AI ECOSYSTEM DIGEST</div>
            <div style="font-size:22px;font-weight:700;margin-bottom:4px;">{slot}のAI情報まとめ</div>
            <div style="font-size:13px;opacity:0.75;">{now} 配信</div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            {sections_html}
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;text-align:center;">
            <div style="font-size:12px;color:#9ca3af;">
              このメールはAI News Mailer（無料版）によって自動送信されました<br>
              Powered by NewsAPI + GitHub Actions
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""
 
 
def send_email(html_body: str, subject: str):
    """Gmail の SMTP でメールを送信する"""
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
        articles = fetch_news(cat["query"])
        sections.append({"label": cat["label"], "color": cat["color"], "articles": articles})
 
    slot    = "朝" if datetime.now().hour < 14 else "夜"
    date_str = datetime.now().strftime("%m/%d")
    subject  = f"【AI情報】{date_str} {slot}のダイジェスト"
 
    html = build_html_email(sections)
    send_email(html, subject)
    print("🎉 完了！")
 
 
if __name__ == "__main__":
    main()
 
