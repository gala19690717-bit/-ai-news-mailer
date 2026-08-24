const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const Fi = require("react-icons/fi");

// ---------- palette ----------
const NAVY = "10243E";
const NAVY2 = "1B3A5C";
const TEAL = "1C7293";
const ACCENT = "FF6B35";
const ACCENT_SOFT = "FFE7DC";
const ICE = "CFE3F2";
const BG = "F4F7FA";
const WHITE = "FFFFFF";
const MUTED = "5D6D7E";
const LINE = "D9E2EC";

const F = "Meiryo";
const W = 13.3, H = 7.5, M = 0.7, CW = W - M * 2;

const shadow = () => ({ type: "outer", color: "9AA9B8", blur: 10, offset: 2, angle: 90, opacity: 0.28 });

async function icon(Comp, color, size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(Comp, { color: "#" + color, size, strokeWidth: 2 })
  );
  const buf = await sharp(Buffer.from(svg), { density: 300 }).resize(size, size).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

(async () => {
  const ICONS = {
    yen: await icon(Fi.FiTrendingDown, ACCENT),
    users: await icon(Fi.FiUserX, ACCENT),
    clock: await icon(Fi.FiClock, ACCENT),
    target: await icon(Fi.FiTarget, WHITE),
    map: await icon(Fi.FiMapPin, WHITE),
    pen: await icon(Fi.FiEdit3, WHITE),
    zap: await icon(Fi.FiZap, WHITE),
    chart: await icon(Fi.FiBarChart2, WHITE),
    check: await icon(Fi.FiCheckCircle, ACCENT),
    home: await icon(Fi.FiHome, TEAL),
  };

  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.theme = { headFontFace: F, bodyFontFace: F };

  const titleBar = (s, txt, sub) => {
    s.addText(txt, {
      x: M, y: 0.45, w: CW, h: 0.75, fontFace: F, fontSize: 30, bold: true,
      color: NAVY, align: "left", margin: 0, valign: "middle",
    });
    if (sub)
      s.addText(sub, {
        x: M, y: 1.18, w: CW, h: 0.4, fontFace: F, fontSize: 14,
        color: MUTED, align: "left", margin: 0, valign: "middle",
      });
  };

  // ============ 1. TITLE ============
  {
    const s = pres.addSlide();
    s.background = { color: NAVY };
    s.addShape(pres.ShapeType.ellipse, {
      x: 10.2, y: -1.6, w: 5.2, h: 5.2, fill: { color: NAVY2 },
    });
    s.addShape(pres.ShapeType.ellipse, {
      x: 11.9, y: 5.6, w: 2.6, h: 2.6, fill: { color: TEAL, transparency: 55 },
    });
    s.addText("採用戦略ウェビナー ｜ 要点まとめ", {
      x: 0.9, y: 1.25, w: 8.5, h: 0.4, fontFace: F, fontSize: 15, bold: true,
      color: ACCENT, charSpacing: 1, margin: 0, valign: "middle",
    });
    s.addText("「相場の半分以下」で\n欲しい人材を、好きなタイミングで。", {
      x: 0.9, y: 1.85, w: 10.4, h: 2.0, fontFace: F, fontSize: 38, bold: true,
      color: WHITE, lineSpacing: 52, margin: 0, valign: "top",
    });
    s.addText("採用を “社内でまわす” ための 5 ステップ", {
      x: 0.9, y: 4.0, w: 9.5, h: 0.5, fontFace: F, fontSize: 18,
      color: ICE, margin: 0, valign: "middle",
    });

    const chips = [
      "コストは相場の 1/2 以下",
      "欲しい人材をピンポイントで",
      "動きたいタイミングで",
      "仕組みが社内に残る",
    ];
    const cw = 2.75, gap = 0.28;
    chips.forEach((c, i) => {
      const x = 0.9 + i * (cw + gap);
      s.addShape(pres.ShapeType.roundRect, {
        x, y: 5.35, w: cw, h: 0.95, rectRadius: 0.12,
        fill: { color: NAVY2 }, line: { color: TEAL, width: 1 },
      });
      s.addText(c, {
        x: x + 0.12, y: 5.35, w: cw - 0.24, h: 0.95, fontFace: F, fontSize: 13,
        color: WHITE, align: "center", valign: "middle", margin: 0,
      });
    });
    s.addNotes("本資料はウェビナーで提示された4つの成果（コスト半減・欲しい人材・タイミング・内製化）を軸に、採用担当がそのまま実務に落とせる形でまとめたものです。");
  }

  // ============ 2. 3つの痛み ============
  {
    const s = pres.addSlide();
    s.background = { color: BG };
    titleBar(s, "いまの採用、なぜうまくいかない？", "多くの会社がぶつかる 3 つの壁");

    const cards = [
      { ic: ICONS.yen, t: "お金が重い", b: "人材紹介の成功報酬は理論年収の 30〜35%。\n年収 500 万円なら 1 人 150〜175 万円。\n5 人採れば 1,000 万円近くが消えます。" },
      { ic: ICONS.users, t: "欲しい人が来ない", b: "応募数は増えても、要件に合う人が混じらない。\n外部まかせだと「自社ならではの魅力」が\n候補者にそのまま伝わりません。" },
      { ic: ICONS.clock, t: "タイミングが選べない", b: "欠員が出てから動くので、いつも後手。\n決まるまで 3〜6 ヶ月かかることもあり、\n現場は待たされ続けます。" },
    ];
    const cw = (CW - 0.9) / 3, cy = 1.85, ch = 4.15;
    cards.forEach((c, i) => {
      const x = M + i * (cw + 0.45);
      s.addShape(pres.ShapeType.roundRect, {
        x, y: cy, w: cw, h: ch, rectRadius: 0.06,
        fill: { color: WHITE }, line: { color: LINE, width: 1 }, shadow: shadow(),
      });
      s.addShape(pres.ShapeType.ellipse, {
        x: x + 0.4, y: cy + 0.42, w: 1.0, h: 1.0, fill: { color: ACCENT_SOFT },
      });
      s.addImage({ data: c.ic, x: x + 0.665, y: cy + 0.685, w: 0.47, h: 0.47 });
      s.addText(c.t, {
        x: x + 0.35, y: cy + 1.55, w: cw - 0.7, h: 0.55, fontFace: F, fontSize: 19,
        bold: true, color: NAVY, margin: 0, valign: "middle",
      });
      s.addText(c.b, {
        x: x + 0.35, y: cy + 2.2, w: cw - 0.7, h: 1.75, fontFace: F, fontSize: 12.5,
        color: MUTED, margin: 0, valign: "top", lineSpacing: 21,
      });
    });
    s.addNotes("痛みの整理。ここで「うちもだ」と共感を作ってから、次のスライドでゴール像を見せる。");
  }

  // ============ 3. ゴール4状態 ============
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    titleBar(s, "このプロセスで たどり着く 4 つの状態", "「たまたま採れた」を、「いつでも採れる」に変える");

    const items = [
      { n: "01", t: "相場の半分以下のコストで", b: "変動費（成功報酬）を固定費（ツール＋自社工数）に置き換える。採る人数が増えるほど 1 人あたりが安くなる構造へ。" },
      { n: "02", t: "欲しい人材を", b: "「来た人から選ぶ」のをやめて、「この人」と決めてから取りにいく。要件を 1 枚に絞るのが出発点。" },
      { n: "03", t: "好きなタイミングで", b: "欠員が出てから探すのではなく、日ごろから候補者との接点を貯めておく。動きたい月に動けるようになる。" },
      { n: "04", t: "社内で内製化できる", b: "外注すると社内にノウハウが残らない。自社で回せば、担当者が変わっても仕組みとして残り続ける。" },
    ];
    const cw = (CW - 0.5) / 2, ch = 2.4;
    items.forEach((it, i) => {
      const x = M + (i % 2) * (cw + 0.5);
      const y = 1.8 + Math.floor(i / 2) * (ch + 0.35);
      const dark = i % 3 === 0;
      s.addShape(pres.ShapeType.roundRect, {
        x, y, w: cw, h: ch, rectRadius: 0.06,
        fill: { color: dark ? NAVY : BG }, line: { color: dark ? NAVY : LINE, width: 1 },
      });
      s.addText(it.n, {
        x: x + 0.42, y: y + 0.3, w: 1.1, h: 0.6, fontFace: F, fontSize: 30, bold: true,
        color: dark ? ACCENT : ACCENT, margin: 0, valign: "middle",
      });
      s.addText(it.t, {
        x: x + 1.45, y: y + 0.3, w: cw - 1.9, h: 0.6, fontFace: F, fontSize: 19, bold: true,
        color: dark ? WHITE : NAVY, margin: 0, valign: "middle",
      });
      s.addText(it.b, {
        x: x + 0.42, y: y + 1.02, w: cw - 0.85, h: 1.15, fontFace: F, fontSize: 13,
        color: dark ? ICE : MUTED, margin: 0, valign: "top", lineSpacing: 21,
      });
    });
    s.addNotes("4つはバラバラの効果ではなく、①の構造転換が②③④を同時に連れてくる、という関係。");
  }

  // ============ 4. コスト構造 + chart ============
  {
    const s = pres.addSlide();
    s.background = { color: BG };
    titleBar(s, "なぜ高い？ お金の流れを見てみよう", "採用単価のめやす（1 人あたり・万円／年収 500 万円クラスの試算例）");

    s.addShape(pres.ShapeType.roundRect, {
      x: M, y: 1.8, w: 7.0, h: 4.35, rectRadius: 0.06,
      fill: { color: WHITE }, line: { color: LINE, width: 1 }, shadow: shadow(),
    });
    s.addChart(
      pres.ChartType.bar,
      [{
        name: "1人あたり採用単価",
        labels: ["リファラル\n（社員紹介）", "ダイレクト\nリクルーティング", "求人媒体", "人材紹介\n（成功報酬35%）"],
        values: [20, 45, 80, 175],
      }],
      {
        x: M + 0.15, y: 1.95, w: 6.7, h: 4.05,
        barDir: "bar", chartColors: [TEAL], showValue: true, dataLabelPosition: "outEnd",
        dataLabelColor: NAVY, dataLabelFontFace: F, dataLabelFontSize: 12, dataLabelFontBold: true,
        showLegend: false, showTitle: false,
        catAxisLabelColor: NAVY, catAxisLabelFontFace: F, catAxisLabelFontSize: 11,
        valAxisLabelColor: MUTED, valAxisLabelFontFace: F, valAxisLabelFontSize: 10,
        valAxisMinVal: 0, valAxisMaxVal: 200, valAxisMajorUnit: 50, valGridLine: { color: "EDF1F5", size: 1 },
        catGridLine: { style: "none" }, barGapWidthPct: 55,
      }
    );

    const rx = 8.1, rw = W - rx - M;
    s.addShape(pres.ShapeType.roundRect, {
      x: rx, y: 1.8, w: rw, h: 1.75, rectRadius: 0.06, fill: { color: NAVY },
    });
    s.addText("500万円 × 35%", {
      x: rx + 0.35, y: 1.98, w: rw - 0.7, h: 0.45, fontFace: F, fontSize: 14,
      color: ICE, margin: 0, valign: "middle",
    });
    s.addText("175万円 / 人", {
      x: rx + 0.35, y: 2.42, w: rw - 0.7, h: 0.75, fontFace: F, fontSize: 34, bold: true,
      color: ACCENT, margin: 0, valign: "middle",
    });
    s.addText([
      { text: "ここがポイント", options: { bold: true, color: NAVY, fontSize: 16, breakLine: true } },
      { text: "成功報酬は「採った人数 × 年収の何%」。つまり採るほど増える 変動費 です。", options: { color: MUTED, fontSize: 13, breakLine: true } },
      { text: "", options: { fontSize: 7, breakLine: true } },
      { text: "内製化すると、ツール利用料＋自社の工数という 固定費 に近づきます。人数が増えるほど 1 人あたりは下がっていく。ここが「半分以下」の正体です。", options: { color: MUTED, fontSize: 13, breakLine: true } },
      { text: "", options: { fontSize: 7, breakLine: true } },
      { text: "※ 金額は一般的な相場からの試算例です。", options: { color: "8A99A8", fontSize: 10 } },
    ], {
      x: rx, y: 3.75, w: rw, h: 2.4, fontFace: F, margin: 0, valign: "top", lineSpacing: 21,
    });
    s.addNotes("変動費→固定費という言い換えが、この回いちばんの肝。");
  }

  // ============ 5. 募集→集客 ============
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    titleBar(s, "発想の転換：「募集」から「集客」へ", "待っていても、いい人は来ない");

    const lw = 5.3, rw2 = 5.3, ax = M + lw + 0.35;
    s.addShape(pres.ShapeType.roundRect, {
      x: M, y: 1.85, w: lw, h: 3.65, rectRadius: 0.06,
      fill: { color: BG }, line: { color: LINE, width: 1 },
    });
    s.addText("これまで ｜ 待ちの採用", {
      x: M + 0.4, y: 2.1, w: lw - 0.8, h: 0.5, fontFace: F, fontSize: 19, bold: true,
      color: MUTED, margin: 0, valign: "middle",
    });
    s.addText([
      { text: "求人を出して、応募を待つ", options: { bullet: true, breakLine: true } },
      { text: "エージェントからの紹介を待つ", options: { bullet: true, breakLine: true } },
      { text: "来た人の中から、いちばんマシな人を選ぶ", options: { bullet: true, breakLine: true } },
      { text: "欠員が出てから、あわてて動き出す", options: { bullet: true, breakLine: true } },
      { text: "採れても、社内には何も残らない", options: { bullet: true } },
    ], {
      x: M + 0.4, y: 2.8, w: lw - 0.8, h: 3.1, fontFace: F, fontSize: 14,
      color: MUTED, margin: 0, valign: "top", paraSpaceAfter: 12,
    });

    s.addShape(pres.ShapeType.rightArrow, {
      x: ax, y: 3.35, w: 0.85, h: 0.7, fill: { color: ACCENT },
    });

    s.addShape(pres.ShapeType.roundRect, {
      x: ax + 1.2, y: 1.85, w: rw2, h: 3.65, rectRadius: 0.06, fill: { color: NAVY },
    });
    s.addText("これから ｜ 攻めの採用", {
      x: ax + 1.6, y: 2.1, w: rw2 - 0.8, h: 0.5, fontFace: F, fontSize: 19, bold: true,
      color: ACCENT, margin: 0, valign: "middle",
    });
    s.addText([
      { text: "「この人が欲しい」を先に決める", options: { bullet: true, breakLine: true } },
      { text: "その人がいる場所へ、自社から会いに行く", options: { bullet: true, breakLine: true } },
      { text: "自社の言葉で、直接口説く", options: { bullet: true, breakLine: true } },
      { text: "ふだんから接点を貯め、動きたい時に動く", options: { bullet: true, breakLine: true } },
      { text: "やり方が社内にノウハウとして残る", options: { bullet: true } },
    ], {
      x: ax + 1.6, y: 2.8, w: rw2 - 0.8, h: 3.1, fontFace: F, fontSize: 14,
      color: WHITE, margin: 0, valign: "top", paraSpaceAfter: 12,
    });
    s.addShape(pres.ShapeType.roundRect, {
      x: M, y: 5.75, w: CW, h: 0.85, rectRadius: 0.06,
      fill: { color: ACCENT_SOFT }, line: { color: ACCENT, width: 1 },
    });
    s.addText("採用は「人事の作業」ではなく「自社のマーケティング」。ここが切り替わると、あとの 5 ステップは全部つながります。", {
      x: M + 0.3, y: 5.75, w: CW - 0.6, h: 0.85, fontFace: F, fontSize: 14, bold: true,
      color: NAVY, align: "center", valign: "middle", margin: 0,
    });
    s.addNotes("採用を「人事の作業」から「自社のマーケティング」に置き換える、という視点転換。");
  }

  // ============ 6. 5ステップ ============
  {
    const s = pres.addSlide();
    s.background = { color: BG };
    titleBar(s, "内製化する 5 つのステップ", "この順番どおりに進めれば、仕組みは必ず立ち上がります");

    const steps = [
      { ic: ICONS.target, t: "要件定義", b: "「本当に必要な人」を\nA4 1 枚にまとめる" },
      { ic: ICONS.map, t: "チャネル選定", b: "その人が実際に\nいる場所を選ぶ" },
      { ic: ICONS.pen, t: "文面づくり", b: "自社の言葉で\n口説く文章を書く" },
      { ic: ICONS.zap, t: "選考体験", b: "速く・気持ちよく\n意思決定してもらう" },
      { ic: ICONS.chart, t: "数字で改善", b: "毎週数字を見て\n1 か所だけ直す" },
    ];
    const colw = CW / 5, cy = 2.15, d = 1.25;
    s.addShape(pres.ShapeType.rect, {
      x: M + colw / 2, y: cy + d / 2 - 0.02, w: CW - colw, h: 0.04, fill: { color: ICE },
    });
    steps.forEach((st, i) => {
      const cx = M + colw * i + colw / 2;
      s.addShape(pres.ShapeType.ellipse, {
        x: cx - d / 2, y: cy, w: d, h: d,
        fill: { color: i === 0 ? ACCENT : NAVY }, line: { color: WHITE, width: 3 },
      });
      s.addImage({ data: st.ic, x: cx - 0.28, y: cy + 0.34, w: 0.56, h: 0.56 });
      s.addShape(pres.ShapeType.ellipse, {
        x: cx + 0.32, y: cy - 0.12, w: 0.5, h: 0.5, fill: { color: WHITE }, line: { color: NAVY, width: 1.5 },
      });
      s.addText(String(i + 1), {
        x: cx + 0.32, y: cy - 0.12, w: 0.5, h: 0.5, fontFace: F, fontSize: 13, bold: true,
        color: NAVY, align: "center", valign: "middle", margin: 0,
      });
      s.addText(st.t, {
        x: cx - colw / 2 + 0.1, y: cy + d + 0.3, w: colw - 0.2, h: 0.45, fontFace: F,
        fontSize: 17, bold: true, color: NAVY, align: "center", valign: "middle", margin: 0,
      });
      s.addText(st.b, {
        x: cx - colw / 2 + 0.1, y: cy + d + 0.78, w: colw - 0.2, h: 1.0, fontFace: F,
        fontSize: 12.5, color: MUTED, align: "center", valign: "top", margin: 0, lineSpacing: 20,
      });
    });
    s.addShape(pres.ShapeType.roundRect, {
      x: M, y: 5.72, w: CW, h: 0.85, rectRadius: 0.06, fill: { color: NAVY },
    });
    s.addText("いちばん多い失敗は、STEP 1 を飛ばして STEP 2 の「ツール選び」から始めてしまうこと。", {
      x: M + 0.3, y: 5.72, w: CW - 0.6, h: 0.85, fontFace: F, fontSize: 14,
      color: WHITE, align: "center", valign: "middle", margin: 0,
    });
    s.addNotes("全体像。以降のスライドで STEP1-2、STEP3-4、STEP5 を分解する。");
  }

  // ============ 7. STEP1-2 ============
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    titleBar(s, "STEP 1-2 ｜ 誰を、どこで探すか", "ここが決まらないまま動くと、お金も時間もこぼれ落ちます");

    const lw = 4.5;
    s.addShape(pres.ShapeType.roundRect, {
      x: M, y: 1.8, w: lw, h: 4.4, rectRadius: 0.06,
      fill: { color: BG }, line: { color: LINE, width: 1 },
    });
    s.addText("STEP 1 ｜ 要件を 1 枚に", {
      x: M + 0.35, y: 2.0, w: lw - 0.7, h: 0.45, fontFace: F, fontSize: 17, bold: true,
      color: NAVY, margin: 0, valign: "middle",
    });
    const rows = [
      ["MUST", "3 つまで", "これが無いと成立しない条件だけ"],
      ["WANT", "自由に", "あったら嬉しい。無くても採る"],
      ["NG", "2 つまで", "これがあったら見送る条件"],
    ];
    rows.forEach((r, i) => {
      const y = 2.6 + i * 1.05;
      s.addShape(pres.ShapeType.roundRect, {
        x: M + 0.35, y, w: lw - 0.7, h: 0.9, rectRadius: 0.05,
        fill: { color: WHITE }, line: { color: LINE, width: 1 },
      });
      s.addText(r[0], {
        x: M + 0.5, y, w: 1.0, h: 0.9, fontFace: F, fontSize: 15, bold: true,
        color: i === 0 ? ACCENT : NAVY, margin: 0, valign: "middle",
      });
      s.addText(r[1], {
        x: M + 1.45, y: y + 0.12, w: lw - 1.85, h: 0.34, fontFace: F, fontSize: 12.5,
        bold: true, color: NAVY, margin: 0, valign: "middle",
      });
      s.addText(r[2], {
        x: M + 1.45, y: y + 0.44, w: lw - 1.85, h: 0.34, fontFace: F, fontSize: 11,
        color: MUTED, margin: 0, valign: "middle",
      });
    });
    s.addText("MUST は 3 つまで。絞るほど会える人は増えます。", {
      x: M + 0.35, y: 5.68, w: lw - 0.7, h: 0.42, fontFace: F, fontSize: 11,
      color: TEAL, bold: true, margin: 0, valign: "middle",
    });

    const rx = M + lw + 0.45, rw3 = W - rx - M;
    s.addText("STEP 2 ｜ 会いに行く場所を選ぶ", {
      x: rx, y: 2.0, w: rw3, h: 0.45, fontFace: F, fontSize: 17, bold: true,
      color: NAVY, margin: 0, valign: "middle",
    });
    s.addTable(
      [
        [
          { text: "チャネル", options: { bold: true, color: WHITE, fill: { color: NAVY } } },
          { text: "費用感", options: { bold: true, color: WHITE, fill: { color: NAVY } } },
          { text: "スピード", options: { bold: true, color: WHITE, fill: { color: NAVY } } },
          { text: "向いている場面", options: { bold: true, color: WHITE, fill: { color: NAVY } } },
        ],
        ["人材紹介", "高い", "速い", "急な欠員・希少な専門職"],
        ["求人媒体", "中くらい", "中くらい", "母集団を一気に集めたい"],
        [{ text: "ダイレクトリクルーティング", options: { bold: true, color: NAVY } }, "低い", "中くらい", "欲しい人を狙って採る"],
        [{ text: "リファラル（社員紹介）", options: { bold: true, color: NAVY } }, "最も低い", "ゆっくり", "定着率を上げたい"],
        ["SNS・採用広報", "低い", "ゆっくり", "中長期で「選ばれる会社」に"],
      ],
      {
        x: rx, y: 2.6, w: rw3, colW: [2.65, 1.1, 1.1, 2.3],
        rowH: 0.5, fontFace: F, fontSize: 11.5, color: MUTED, valign: "middle",
        border: { type: "solid", color: LINE, pt: 1 }, align: "left", margin: 6,
      }
    );
    s.addText("下の 2 つを自社で回せるようにすることが「内製化」です。", {
      x: rx, y: 5.75, w: rw3, h: 0.4, fontFace: F, fontSize: 11.5,
      color: TEAL, bold: true, margin: 0, valign: "middle",
    });
    s.addNotes("要件の絞り込み＋チャネル選定。ダイレクト×リファラルの二本柱が内製化の中心。");
  }

  // ============ 8. STEP3-4 ============
  {
    const s = pres.addSlide();
    s.background = { color: BG };
    titleBar(s, "STEP 3-4 ｜ 刺さる文面 × 速い選考", "同じ人に送っても、書き方と速さで結果は変わります");

    const bw = 5.65;
    const boxes = [
      {
        x: M, fill: WHITE, line: LINE, tag: "BEFORE ｜ 届かない文面", tagC: MUTED, tc: NAVY, bc: MUTED,
        body: "「弊社は成長企業です。ぜひ一度カジュアル面談を。」\n\n・誰にでも送れる（＝誰にも刺さらない）\n・会社の話しかしていない\n・相手にとっての得が書かれていない",
      },
      {
        x: M + bw + 0.6, fill: NAVY, line: NAVY, tag: "AFTER ｜ 返信が来る文面", tagC: ACCENT, tc: WHITE, bc: ICE,
        body: "「〇〇の経験に惹かれました。当社の△△を、あなたなら□□にできると思っています。」\n\n・その人の経歴に触れている（1 行でいい）\n・任せたい仕事が具体的\n・相手が得られるものが書いてある",
      },
    ];
    boxes.forEach((b) => {
      s.addShape(pres.ShapeType.roundRect, {
        x: b.x, y: 1.8, w: bw, h: 2.65, rectRadius: 0.06,
        fill: { color: b.fill }, line: { color: b.line, width: 1 },
      });
      s.addText(b.tag, {
        x: b.x + 0.35, y: 1.98, w: bw - 0.7, h: 0.4, fontFace: F, fontSize: 13, bold: true,
        color: b.tagC, margin: 0, valign: "middle",
      });
      s.addText(b.body, {
        x: b.x + 0.35, y: 2.42, w: bw - 0.7, h: 1.95, fontFace: F, fontSize: 12.5,
        color: b.bc, margin: 0, valign: "top", lineSpacing: 21,
      });
    });

    const tiles = [
      { n: "48", u: "時間以内", t: "返信・日程返しはここまで。\n迷っている時間に他社が決めます。" },
      { n: "2", u: "週間以内", t: "初回接触から内定まで。\n長引くほど熱は冷めます。" },
      { n: "2", u: "回まで", t: "面接の回数。増やすほど\n辞退率が上がっていきます。" },
    ];
    const tw = (CW - 0.9) / 3;
    tiles.forEach((t, i) => {
      const x = M + i * (tw + 0.45);
      s.addShape(pres.ShapeType.roundRect, {
        x, y: 4.75, w: tw, h: 1.75, rectRadius: 0.06,
        fill: { color: WHITE }, line: { color: LINE, width: 1 }, shadow: shadow(),
      });
      s.addText([
        { text: t.n, options: { fontSize: 34, bold: true, color: ACCENT, fontFace: F } },
        { text: "  " + t.u, options: { fontSize: 14, bold: true, color: NAVY, fontFace: F } },
      ], { x: x + 0.3, y: 4.87, w: tw - 0.6, h: 0.62, margin: 0, valign: "middle" });
      s.addText(t.t, {
        x: x + 0.3, y: 5.55, w: tw - 0.6, h: 0.8, fontFace: F, fontSize: 11.5,
        color: MUTED, margin: 0, valign: "top", lineSpacing: 18,
      });
    });
    s.addNotes("文面テンプレは「相手の経歴1行 → 任せたい仕事 → 相手の得」の3ブロック構成で運用。");
  }

  // ============ 9. ファネル ============
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    titleBar(s, "STEP 5 ｜ 数字で回す", "見るのは合計人数ではなく、「どこで減ったか」だけ");

    const stages = [
      { l: "接触（スカウト送信・声かけ）", w: 7.0 },
      { l: "返信・応募", w: 5.85 },
      { l: "面談・カジュアル面談", w: 4.7 },
      { l: "最終面接", w: 3.55 },
      { l: "内定承諾", w: 2.4 },
    ];
    const cx = M + 3.5;
    stages.forEach((st, i) => {
      const y = 1.95 + i * 0.9;
      const dark = i === stages.length - 1;
      s.addShape(pres.ShapeType.roundRect, {
        x: cx - st.w / 2, y, w: st.w, h: 0.74, rectRadius: 0.05,
        fill: { color: dark ? ACCENT : NAVY, transparency: dark ? 0 : 8 + i * 12 },
      });
      s.addText(st.l, {
        x: cx - st.w / 2, y, w: st.w, h: 0.74, fontFace: F, fontSize: 13, bold: true,
        color: WHITE, align: "center", valign: "middle", margin: 0,
      });
    });

    const rx = M + 7.4, rw4 = W - rx - M;
    s.addShape(pres.ShapeType.roundRect, {
      x: rx, y: 1.95, w: rw4, h: 4.2, rectRadius: 0.06,
      fill: { color: BG }, line: { color: LINE, width: 1 },
    });
    s.addText("毎週みる 3 つの「率」", {
      x: rx + 0.35, y: 2.15, w: rw4 - 0.7, h: 0.45, fontFace: F, fontSize: 17, bold: true,
      color: NAVY, margin: 0, valign: "middle",
    });
    const kpis = [
      ["返信率", "接触 → 返信。低いなら 文面 を直す"],
      ["面談化率", "返信 → 面談。低いなら 日程調整の速さ を直す"],
      ["内定承諾率", "内定 → 承諾。低いなら 動機づけと条件 を直す"],
    ];
    kpis.forEach((k, i) => {
      const y = 2.75 + i * 0.95;
      s.addImage({ data: ICONS.check, x: rx + 0.35, y: y + 0.06, w: 0.28, h: 0.28 });
      s.addText(k[0], {
        x: rx + 0.72, y, w: rw4 - 1.05, h: 0.38, fontFace: F, fontSize: 14, bold: true,
        color: NAVY, margin: 0, valign: "middle",
      });
      s.addText(k[1], {
        x: rx + 0.72, y: y + 0.36, w: rw4 - 1.05, h: 0.5, fontFace: F, fontSize: 11.5,
        color: MUTED, margin: 0, valign: "top", lineSpacing: 17,
      });
    });
    s.addText("直すのは、いちばん落ちている 1 か所だけ。同時に変えると、何が効いたか分からなくなります。", {
      x: rx + 0.35, y: 5.55, w: rw4 - 0.7, h: 0.55, fontFace: F, fontSize: 11.5,
      color: TEAL, bold: true, margin: 0, valign: "top", lineSpacing: 17,
    });
    s.addNotes("ファネルは率で見る。改善は一度に1か所。");
  }

  // ============ 10. 30日プラン ============
  {
    const s = pres.addSlide();
    s.background = { color: NAVY };
    s.addShape(pres.ShapeType.ellipse, {
      x: -1.8, y: 5.4, w: 4.4, h: 4.4, fill: { color: NAVY2 },
    });
    s.addText("明日から動く 30 日プラン", {
      x: M, y: 0.5, w: CW, h: 0.75, fontFace: F, fontSize: 30, bold: true,
      color: WHITE, margin: 0, valign: "middle",
    });
    s.addText("まずは 1 ポジションだけで試す。うまくいった型を、他のポジションに広げていきます。", {
      x: M, y: 1.22, w: CW, h: 0.4, fontFace: F, fontSize: 14,
      color: ICE, margin: 0, valign: "middle",
    });

    const weeks = [
      { w: "WEEK 1", t: "決める", b: "・対象ポジションを 1 つ選ぶ\n・MUST 3 つ / NG 2 つを決める\n・現場責任者と 30 分すり合わせ\n・いまの採用単価を計算する\n・使う媒体の候補を 3 つ調べる" },
      { w: "WEEK 2-3", t: "動かす", b: "・ダイレクト媒体を 1 つ契約\n・スカウト文を 3 パターン用意\n・週 30 通を目安に送る\n・社員紹介の声かけも同時に開始\n・返信は 48 時間以内に日程返し" },
      { w: "WEEK 4", t: "見直す", b: "・返信率 / 面談化率を集計\n・いちばん低い 1 か所を直す\n・単価を紹介会社と比べる\n・翌月の送信本数を決める\n・効いた文面を型として保存" },
    ];
    const cw = (CW - 0.9) / 3;
    weeks.forEach((k, i) => {
      const x = M + i * (cw + 0.45);
      s.addShape(pres.ShapeType.roundRect, {
        x, y: 1.9, w: cw, h: 3.5, rectRadius: 0.06,
        fill: { color: WHITE },
      });
      s.addText(k.w, {
        x: x + 0.35, y: 2.1, w: cw - 0.7, h: 0.38, fontFace: F, fontSize: 12.5, bold: true,
        color: ACCENT, charSpacing: 1, margin: 0, valign: "middle",
      });
      s.addText(k.t, {
        x: x + 0.35, y: 2.5, w: cw - 0.7, h: 0.5, fontFace: F, fontSize: 22, bold: true,
        color: NAVY, margin: 0, valign: "middle",
      });
      s.addText(k.b, {
        x: x + 0.35, y: 3.05, w: cw - 0.7, h: 2.3, fontFace: F, fontSize: 12.5,
        color: MUTED, margin: 0, valign: "top", lineSpacing: 24,
      });
    });
    s.addText("採用は「才能」ではなく「手順」。この 30 日で、自社の型がひとつできます。", {
      x: M, y: 5.65, w: CW, h: 0.8, fontFace: F, fontSize: 17, bold: true,
      color: WHITE, align: "center", valign: "middle", margin: 0,
    });
    s.addNotes("初月は1ポジション限定。単価比較まで出すと社内の説得材料になる。");
  }

  await pres.writeFile({ fileName: process.argv[2] || "recruitment.pptx" });
  console.log("written");
})();
