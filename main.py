"""
AI News Mailer（日本語RSS版）
日本語RSSフィードからAI最新情報を収集し、毎日2回メールで送信するスクリプト
"""
 
import os
import smtplib
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
 
# ── 設定 ──────────────────────────────────────────────
GMAIL_USER         = os.environ["GMAIL_USER"]
GMAIL_APP_PASSWORD = os.environ["GMAIL_APP_PASSWORD"]
RECIPIENT_EMAIL    = os.environ["RECIPIENT_EMAIL"]
# ──────────────────────────────────────────────────────
 
# 日本語AIニュースのRSSフィード
RSS_SOURCES = [
    {
        "label": "📰 ITmedia AI",
        "url": "https://rss.itmedia.co.jp/rss/2.0/aiplus.xml",
        "color": "#7c3aed",
    },
    {
        "label": "🏢 TechCrunch Japan",
        "url": "https://jp.techcrunch.com/feed/",
        "color": "#0969da",
    },
    {
        "label": "🔬 Ledge.ai",
        "url": "https://ledge.ai/feed/",
        "color": "#2da44e",
    },
    {
        "label": "📈 AIsmiley",
        "url": "https://aismiley.co.jp/feed/",
        "color": "#e85d04",
    },
]
 
 
def fetch_rss(url: str, max_items: int = 5) -> list[dict]:
    """RSSフィードから記事を取得する"""
    headers = {"User-Agent": "Mozilla/5.0 (compatible; AI-News-Mailer/1.0)"}
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as res:
            content = res.read()
        root = ET.fromstring(content)
        ns = {"atom": "http://www.w3.org/2005/Atom"}
 
        articles = []
        # RSS 2.0形式
        for item in root.findall(".//item")[:max_items]:
            title = item.findtext("title") or ""
            link  = item.findtext("link") or "#"
            desc  = item.findtext("description") or ""
            date  = item.findtext("pubDate") or ""
            # HTMLタグを除去
            import re
            desc = re.sub(r"<[^>]+>", "", desc)[:150]
            articles.append({
                "title": title.strip(),
                "url": link.strip(),
                "description": desc.strip(),
                "publishedAt": date[:16],
                "source": url,
            })
        return articles
    except Exception as e:
        print(f"  ⚠️  RSS取得エラー ({url}): {e}")
        return []
 
 
def format_article(article: dict) -> str:
    """記事をHTML形式に変換する"""
    title       = article.get("title", "タイトルなし")
    description = article.get("description", "")
    url         = article.get("url", "#")
    published   = article.get("publishedAt", "")
 
    return f"""
    <div style="border-left: 3px solid #e5e7eb; padding: 8px 0 8px 14px; margin-bottom: 14px;">
      <a href="{url}" style="font-size:14px;font-weight:600;color:#1a1a2e;text-decoration:none;line-height:1.5;">
        {title}
      </a>
      <div style="font-size:12px;color:#6b7280;margin:3px 0 5px;">
        {published}
      </div>
      <div style="font-size:13px;color:#374151;line-height:1.6;">
        {description + "…" if description else ""}
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
              このメールはAI News Mailer（日本語RSS版）によって自動送信されました<br>
              Powered by 日本語RSSフィード + GitHub Actions
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
    for src in RSS_SOURCES:
        print(f"  取得中: {src['label']}")
        articles = fetch_rss(src["url"])
        sections.append({"label": src["label"], "color": src["color"], "articles": articles})
 
    slot     = "朝" if datetime.now().hour < 14 else "夜"
    date_str = datetime.now().strftime("%m/%d")
    subject  = f"【AI情報】{date_str} {slot}のダイジェスト"
 
    html = build_html_email(sections)
    send_email(html, subject)
    print("🎉 完了！")
 
 
if __name__ == "__main__":
    main()
