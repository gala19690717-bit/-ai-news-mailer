const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const Fi = require("react-icons/fi");

// ---- palette (derived from the client's proposal PDF) ----
const NAVY = "1B365D";
const NAVY_DK = "12253F";
const TERRA = "E07A5F";
const TERRA_SOFT = "F9E5DC";
const AI = "2A9D8F";
const AI_SOFT = "DFF0ED";
const SLATE = "3D405B";
const BG = "F7F5EF";
const CARD = "FFFFFF";
const MUTED = "5F6672";
const LINE = "E0DED8";
const ICE = "D6E2F0";

const F = "Meiryo";
const W = 13.3, M = 0.7, CW = W - M * 2;
const sh = () => ({ type: "outer", color: "B5B0A4", blur: 9, offset: 2, angle: 90, opacity: 0.3 });

async function icon(C, color, size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(C, { color: "#" + color, size, strokeWidth: 2 })
  );
  const b = await sharp(Buffer.from(svg), { density: 300 }).resize(size, size).png().toBuffer();
  return "image/png;base64," + b.toString("base64");
}

(async () => {
  const I = {
    eye: await icon(Fi.FiEye, CARD), layers: await icon(Fi.FiLayers, CARD),
    click: await icon(Fi.FiMousePointer, CARD), heart: await icon(Fi.FiHeart, CARD),
    cpu: await icon(Fi.FiCpu, CARD), cpuT: await icon(Fi.FiCpu, AI),
    check: await icon(Fi.FiCheckCircle, TERRA), checkG: await icon(Fi.FiCheckCircle, AI),
    alert: await icon(Fi.FiAlertCircle, TERRA), yen: await icon(Fi.FiTrendingDown, TERRA),
    video: await icon(Fi.FiVideo, TERRA), users: await icon(Fi.FiUsers, TERRA),
    file: await icon(Fi.FiFileText, TERRA), chart: await icon(Fi.FiBarChart2, TERRA),
    map: await icon(Fi.FiMap, CARD), zap: await icon(Fi.FiZap, CARD),
    search: await icon(Fi.FiSearch, NAVY), globe: await icon(Fi.FiGlobe, CARD),
  };

  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.theme = { headFontFace: F, bodyFontFace: F };

  // ---- reusable header: MODULE chip + title + subtitle ----
  const head = (s, mod, title, sub) => {
    let ty = 0.45;
    if (mod) {
      s.addShape(pres.ShapeType.roundRect, {
        x: M, y: 0.38, w: 1.95, h: 0.36, rectRadius: 0.05, fill: { color: TERRA },
      });
      s.addText(mod, {
        x: M, y: 0.38, w: 1.95, h: 0.36, fontFace: F, fontSize: 11.5, bold: true,
        color: CARD, align: "center", valign: "middle", margin: 0, charSpacing: 1,
      });
      ty = 0.84;
    }
    s.addText(title, {
      x: M, y: ty, w: CW, h: 0.62, fontFace: F, fontSize: 27, bold: true,
      color: NAVY, margin: 0, valign: "middle",
    });
    if (sub)
      s.addText(sub, {
        x: M, y: ty + 0.6, w: CW, h: 0.36, fontFace: F, fontSize: 13,
        color: MUTED, margin: 0, valign: "middle",
      });
  };

  // ---- reusable AI callout bar ----
  const aiBar = (s, y, label, body) => {
    s.addShape(pres.ShapeType.roundRect, {
      x: M, y, w: CW, h: 0.8, rectRadius: 0.06,
      fill: { color: AI_SOFT }, line: { color: AI, width: 1 },
    });
    s.addImage({ data: I.cpuT, x: M + 0.28, y: y + 0.22, w: 0.36, h: 0.36 });
    s.addText([
      { text: label + "  ", options: { bold: true, color: AI, fontSize: 12.5, fontFace: F } },
      { text: body, options: { color: SLATE, fontSize: 12, fontFace: F } },
    ], { x: M + 0.78, y, w: CW - 1.05, h: 0.8, margin: 0, valign: "middle" });
  };

  const note = (s, y, txt, color) => {
    s.addText(txt, {
      x: M, y, w: CW, h: 0.35, fontFace: F, fontSize: 10,
      color: color || "8A8578", margin: 0, valign: "middle",
    });
  };

  const tblOpts = (colW) => ({
    x: M, w: CW, colW, fontFace: F, fontSize: 11.5, color: SLATE, valign: "middle",
    border: { type: "solid", color: LINE, pt: 1 }, align: "left", margin: 6,
  });
  const th = (t) => ({ text: t, options: { bold: true, color: CARD, fill: { color: NAVY } } });

  /* ==================== P1 表紙 ==================== */
  {
    const s = pres.addSlide();
    s.background = { color: NAVY_DK };
    s.addShape(pres.ShapeType.ellipse, { x: 9.8, y: -2.0, w: 6.0, h: 6.0, fill: { color: NAVY } });
    s.addShape(pres.ShapeType.ellipse, { x: 11.6, y: 5.2, w: 3.0, h: 3.0, fill: { color: TERRA, transparency: 65 } });
    s.addText("AI採用アドバンス講座", {
      x: 0.9, y: 1.1, w: 8.5, h: 0.42, fontFace: F, fontSize: 16, bold: true,
      color: TERRA, charSpacing: 2, margin: 0, valign: "middle",
    });
    s.addText("求めるケアスタッフを集める\n「0円採用」の設計図", {
      x: 0.9, y: 1.7, w: 10.2, h: 2.1, fontFace: F, fontSize: 40, bold: true,
      color: CARD, lineSpacing: 56, margin: 0, valign: "top",
    });
    s.addText("介護・福祉事業のための 自社採用 内製化プログラム ／ 全 6 モジュール", {
      x: 0.9, y: 3.95, w: 10.0, h: 0.5, fontFace: F, fontSize: 17,
      color: ICE, margin: 0, valign: "middle",
    });
    const chips = ["紹介手数料を ゼロ に", "採用ファネル 4 段階", "AI で原稿と分析を代行", "90 日で仕組み化"];
    const cw = 2.72, gap = 0.3;
    chips.forEach((c, i) => {
      const x = 0.9 + i * (cw + gap);
      s.addShape(pres.ShapeType.roundRect, {
        x, y: 5.25, w: cw, h: 0.9, rectRadius: 0.12,
        fill: { color: NAVY }, line: { color: TERRA, width: 1 },
      });
      s.addText(c, {
        x: x + 0.1, y: 5.25, w: cw - 0.2, h: 0.9, fontFace: F, fontSize: 12.5,
        color: CARD, align: "center", valign: "middle", margin: 0,
      });
    });
    s.addText("株式会社ヤマシタ 御中 ／ 2026年8月", {
      x: 0.9, y: 6.45, w: 8.0, h: 0.35, fontFace: F, fontSize: 11,
      color: "8FA3BC", margin: 0, valign: "middle",
    });
    s.addNotes("本講座は「求めるケアスタッフを集める0円採用術」の提案内容を、実行できる教材の形に詳細化したものです。");
  }

  /* ==================== P2 ゴール ==================== */
  {
    const s = pres.addSlide();
    s.background = { color: BG };
    head(s, null, "この講座を終えたとき、何が変わるか", "「採用がうまい会社」ではなく「採用が仕組みになっている会社」になる");

    const bw = 5.6;
    [
      { x: M, fill: CARD, ln: LINE, tag: "BEFORE ｜ いまの採用", tc: MUTED, bc: MUTED,
        body: "・求人を出して、応募が来るのを待つ\n・足りなければ紹介会社に依頼する\n・1 人採るたびに手数料が飛んでいく\n・うまくいった理由が誰にも説明できない\n・担当者が辞めると、やり方ごと消える" },
      { x: M + bw + 0.7, fill: NAVY, ln: NAVY, tag: "AFTER ｜ 講座を終えたあと", tc: TERRA, bc: CARD,
        body: "・求職者の心理段階ごとに打ち手を持っている\n・自社の採用ページに応募が入ってくる\n・掲載料 0 円のツールで露出が回り続ける\n・原稿づくりと数値集計を AI が代行する\n・仕組みが会社の資産として残る" },
    ].forEach((b) => {
      s.addShape(pres.ShapeType.roundRect, {
        x: b.x, y: 1.75, w: bw, h: 3.05, rectRadius: 0.06,
        fill: { color: b.fill }, line: { color: b.ln, width: 1 },
      });
      s.addText(b.tag, {
        x: b.x + 0.35, y: 1.95, w: bw - 0.7, h: 0.4, fontFace: F, fontSize: 14, bold: true,
        color: b.tc, margin: 0, valign: "middle",
      });
      s.addText(b.body, {
        x: b.x + 0.35, y: 2.4, w: bw - 0.7, h: 2.3, fontFace: F, fontSize: 12.5,
        color: b.bc, margin: 0, valign: "top", lineSpacing: 24,
      });
    });
    s.addShape(pres.ShapeType.rightArrow, {
      x: M + bw + 0.13, y: 3.0, w: 0.5, h: 0.55, fill: { color: TERRA },
    });

    const tiles = [
      { n: "20〜30%", u: "が手数料の相場", t: "介護職の年収 300〜400 万円なら\n1 人あたり 60〜120 万円。" },
      { n: "0円", u: "が掲載料の目安", t: "Engage → Indeed・Google しごと検索\nへの掲載は無料枠で回せます。" },
      { n: "4段階", u: "で求職者は動く", t: "認知 → 比較 → 行動 → 確信。\nどこで止まるかを特定します。" },
    ];
    const tw = (CW - 0.9) / 3;
    tiles.forEach((t, i) => {
      const x = M + i * (tw + 0.45);
      s.addShape(pres.ShapeType.roundRect, {
        x, y: 5.0, w: tw, h: 1.5, rectRadius: 0.06,
        fill: { color: CARD }, line: { color: LINE, width: 1 }, shadow: sh(),
      });
      s.addText([
        { text: t.n, options: { fontSize: 22, bold: true, color: TERRA, fontFace: F } },
        { text: "  " + t.u, options: { fontSize: 10.5, bold: true, color: NAVY, fontFace: F } },
      ], { x: x + 0.28, y: 5.12, w: tw - 0.56, h: 0.55, margin: 0, valign: "middle" });
      s.addText(t.t, {
        x: x + 0.28, y: 5.68, w: tw - 0.56, h: 0.7, fontFace: F, fontSize: 11,
        color: MUTED, margin: 0, valign: "top", lineSpacing: 17,
      });
    });
    note(s, 6.6, "※ 金額は業界一般の相場からの試算例です。実際の単価は職種・地域・契約条件で変わります。");
    s.addNotes("ゴール像を先に共有する。数字は「置き換えの余地がこれだけある」ことを示すための目安。");
  }

  /* ==================== P3 カリキュラム全体像 ==================== */
  {
    const s = pres.addSlide();
    s.background = { color: CARD };
    head(s, null, "カリキュラム全体像 ｜ 全 6 モジュール", "上から順に進めます。1 つ飛ばすと、次のモジュールが機能しません");

    const mods = [
      { n: "MODULE 0", t: "現状把握", b: "いまの採用単価と\nボトルネックを数字にする", ic: I.search },
      { n: "MODULE 1", t: "ファネル設計", b: "認知・比較・行動・確信の\n4 段階に打ち手を割り当てる", ic: I.search },
      { n: "MODULE 2", t: "0円採用の土台", b: "Engage を軸に、掲載料 0 円の\n露出経路を組み立てる", ic: I.search },
      { n: "MODULE 3", t: "採用ページとAI原稿", b: "鉄板の 6 ブロック構成を\nAI と一緒に書き上げる", ic: I.search },
      { n: "MODULE 4", t: "体験型選考", b: "職場体験会で不安を\n「ここで働きたい」に変える", ic: I.search },
      { n: "MODULE 5", t: "数値運用", b: "毎週 15 分の会議で\n1 か所ずつ直し続ける", ic: I.search },
    ];
    const cw = (CW - 0.7) / 3, ch = 2.0;
    mods.forEach((m, i) => {
      const x = M + (i % 3) * (cw + 0.35);
      const y = 1.82 + Math.floor(i / 3) * (ch + 0.28);
      const dark = i === 0 || i === 4;
      s.addShape(pres.ShapeType.roundRect, {
        x, y, w: cw, h: ch, rectRadius: 0.06,
        fill: { color: dark ? NAVY : BG }, line: { color: dark ? NAVY : LINE, width: 1 },
      });
      s.addText(m.n, {
        x: x + 0.32, y: y + 0.25, w: cw - 0.64, h: 0.32, fontFace: F, fontSize: 11.5, bold: true,
        color: TERRA, charSpacing: 1, margin: 0, valign: "middle",
      });
      s.addText(m.t, {
        x: x + 0.32, y: y + 0.6, w: cw - 0.64, h: 0.5, fontFace: F, fontSize: 20, bold: true,
        color: dark ? CARD : NAVY, margin: 0, valign: "middle",
      });
      s.addText(m.b, {
        x: x + 0.32, y: y + 1.12, w: cw - 0.64, h: 0.8, fontFace: F, fontSize: 12,
        color: dark ? ICE : MUTED, margin: 0, valign: "top", lineSpacing: 20,
      });
    });
    aiBar(s, 6.3, "AI はどこで使う？",
      "MODULE 3 の原稿づくりと MODULE 5 の数値集計が中心。AI は「書く・数える」を代行し、決めるのは人が担当します。");
    s.addNotes("6モジュールの地図。MODULE 0 の現状把握を飛ばすと、改善の効果が測れなくなる。");
  }

  /* ==================== P4 M0-1 構造的課題 ==================== */
  {
    const s = pres.addSlide();
    s.background = { color: BG };
    head(s, "MODULE 0", "なぜ、いままでのやり方が効かなくなったのか", "介護業界は「求人を出せば応募が来る」時代から完全に抜けています");

    const cards = [
      { ic: I.yen, t: "コストだけが膨らむ", b: "求人サイトへの出稿だけでは応募に\n至らない。SNS 広告のクリック課金、\nIndeed 運用費、紹介手数料が\n積み上がっても成果が伴わない。" },
      { ic: I.users, t: "超売手市場", b: "求人倍率が高騰し、求職者が複数の\n施設を並べて比べるのが当たり前に。\n「選ぶ側」から「選ばれる側」へ\n立場が入れ替わっています。" },
      { ic: I.alert, t: "採用が「作業」になっている", b: "求人票を出す・広告を打つという\n部分的な作業と捉えているため、\n心理の変化と比較検討の流れを\n全体として設計できていない。" },
    ];
    const cw = (CW - 0.9) / 3;
    cards.forEach((c, i) => {
      const x = M + i * (cw + 0.45);
      s.addShape(pres.ShapeType.roundRect, {
        x, y: 1.88, w: cw, h: 3.45, rectRadius: 0.06,
        fill: { color: CARD }, line: { color: LINE, width: 1 }, shadow: sh(),
      });
      s.addShape(pres.ShapeType.ellipse, { x: x + 0.35, y: 2.14, w: 0.8, h: 0.8, fill: { color: TERRA_SOFT } });
      s.addImage({ data: c.ic, x: x + 0.555, y: 2.345, w: 0.41, h: 0.41 });
      s.addText(c.t, {
        x: x + 0.35, y: 3.06, w: cw - 0.7, h: 0.72, fontFace: F, fontSize: 16, bold: true,
        color: NAVY, margin: 0, valign: "top", lineSpacing: 22,
      });
      s.addText(c.b, {
        x: x + 0.35, y: 3.84, w: cw - 0.7, h: 1.4, fontFace: F, fontSize: 11,
        color: MUTED, margin: 0, valign: "top", lineSpacing: 18,
      });
    });
    s.addShape(pres.ShapeType.roundRect, {
      x: M, y: 5.55, w: CW, h: 0.95, rectRadius: 0.06, fill: { color: NAVY },
    });
    s.addText("この 3 つは別々の問題ではありません。「全体を設計していない」という 1 つの原因から出ています。", {
      x: M + 0.4, y: 5.55, w: CW - 0.8, h: 0.95, fontFace: F, fontSize: 15, bold: true,
      color: CARD, align: "center", valign: "middle", margin: 0,
    });
    s.addNotes("構造的課題は「部分最適の作業化」。ここを共通認識にしてからファネルの話に入る。");
  }

  /* ==================== P5 M0-2 コスト可視化 ==================== */
  {
    const s = pres.addSlide();
    s.background = { color: CARD };
    head(s, "MODULE 0", "ワーク①：自社の採用単価を数字にする", "改善の効果は、はじめの数字がないと測れません（1 人あたり・万円）");

    s.addShape(pres.ShapeType.roundRect, {
      x: M, y: 1.95, w: 6.9, h: 4.05, rectRadius: 0.06,
      fill: { color: BG }, line: { color: LINE, width: 1 },
    });
    s.addChart(pres.ChartType.bar, [{
      name: "1人あたり採用単価",
      labels: ["自社採用ページ\n（Engage 中心）", "求人媒体・\nIndeed 運用", "紹介会社\n（年収の 25%）"],
      values: [12, 45, 90],
    }], {
      x: M + 0.15, y: 2.1, w: 6.6, h: 3.75,
      barDir: "bar", chartColors: [NAVY], showValue: true, dataLabelPosition: "outEnd",
      dataLabelColor: NAVY, dataLabelFontFace: F, dataLabelFontSize: 12, dataLabelFontBold: true,
      showLegend: false, showTitle: false,
      catAxisLabelColor: NAVY, catAxisLabelFontFace: F, catAxisLabelFontSize: 11,
      valAxisLabelColor: MUTED, valAxisLabelFontFace: F, valAxisLabelFontSize: 10,
      valAxisMinVal: 0, valAxisMaxVal: 100, valAxisMajorUnit: 25,
      valGridLine: { color: "EDEAE2", size: 1 }, catGridLine: { style: "none" }, barGapWidthPct: 60,
    });

    const rx = M + 7.2, rw = W - rx - M;
    s.addText("この 4 つを埋めるだけ", {
      x: rx, y: 1.95, w: rw, h: 0.4, fontFace: F, fontSize: 16, bold: true,
      color: NAVY, margin: 0, valign: "middle",
    });
    const items = [
      ["① 直近 1 年の採用人数", "常勤・非常勤を分けて数える"],
      ["② かかった費用の合計", "手数料・広告費・媒体費をすべて足す"],
      ["③ ② ÷ ① ＝ 採用単価", "これが今の「1 人いくら」"],
      ["④ 定着した人数", "半年後に残っている人数も出す"],
    ];
    items.forEach((it, i) => {
      const y = 2.45 + i * 0.82;
      s.addShape(pres.ShapeType.roundRect, {
        x: rx, y, w: rw, h: 0.7, rectRadius: 0.05,
        fill: { color: BG }, line: { color: LINE, width: 1 },
      });
      s.addText(it[0], {
        x: rx + 0.25, y: y + 0.08, w: rw - 0.5, h: 0.3, fontFace: F, fontSize: 12.5, bold: true,
        color: NAVY, margin: 0, valign: "middle",
      });
      s.addText(it[1], {
        x: rx + 0.25, y: y + 0.36, w: rw - 0.5, h: 0.28, fontFace: F, fontSize: 10.5,
        color: MUTED, margin: 0, valign: "middle",
      });
    });
    s.addText("④ まで出すのが肝心です。安く採っても半年で辞めるなら、単価は倍になっているのと同じです。", {
      x: rx, y: 5.75, w: rw, h: 0.55, fontFace: F, fontSize: 11, bold: true,
      color: TERRA, margin: 0, valign: "top", lineSpacing: 17,
    });
    note(s, 6.45, "※ グラフは相場からの試算例。自社の実数に置き換えて使ってください。");
    s.addNotes("最初の宿題。この4つの数字が、以降すべてのモジュールの評価基準になる。");
  }

  /* ==================== P6 M1-1 ファネル4段階 ==================== */
  {
    const s = pres.addSlide();
    s.background = { color: BG };
    head(s, "MODULE 1", "採用ファネル ｜ 求職者が動く 4 つの段階", "採用活動はマーケティングと同じ構造。段階ごとに、かける手が違います");

    const st = [
      { l: "① 認知", p: "「こんな施設があるんだ」", w: 7.4, c: NAVY, ic: I.eye },
      { l: "② 比較", p: "「どうしてここなんだろう」", w: 6.2, c: "2C4E76", ic: I.layers },
      { l: "③ 行動", p: "「応募しても大丈夫そう」", w: 5.0, c: "4A6B92", ic: I.click },
      { l: "④ 確信", p: "「ここで働きたい」", w: 3.8, c: TERRA, ic: I.heart },
    ];
    const cx = M + 3.9;
    st.forEach((x0, i) => {
      const y = 2.0 + i * 1.02;
      s.addShape(pres.ShapeType.roundRect, {
        x: cx - x0.w / 2, y, w: x0.w, h: 0.86, rectRadius: 0.05, fill: { color: x0.c },
      });
      s.addImage({ data: x0.ic, x: cx - x0.w / 2 + 0.3, y: y + 0.24, w: 0.38, h: 0.38 });
      s.addText(x0.l, {
        x: cx - x0.w / 2 + 0.8, y, w: 1.15, h: 0.86, fontFace: F, fontSize: 15, bold: true,
        color: CARD, margin: 0, valign: "middle",
      });
      s.addText(x0.p, {
        x: cx - x0.w / 2 + 1.95, y, w: x0.w - 2.15, h: 0.86, fontFace: F, fontSize: 12,
        color: CARD, margin: 0, valign: "middle",
      });
    });

    const rx = M + 8.5, rw = W - rx - M;
    s.addShape(pres.ShapeType.roundRect, {
      x: rx, y: 2.0, w: rw, h: 3.9, rectRadius: 0.06,
      fill: { color: CARD }, line: { color: LINE, width: 1 }, shadow: sh(),
    });
    s.addText("企業側がやること", {
      x: rx + 0.3, y: 2.2, w: rw - 0.6, h: 0.4, fontFace: F, fontSize: 15, bold: true,
      color: NAVY, margin: 0, valign: "middle",
    });
    const dos = [
      "まず知ってもらう\n（検索上位表示・SNS 発信）",
      "理念と現場の魅力を伝え、\n選ばれる理由をつくる",
      "応募しやすい導線をつくる\n（入力と不安の壁を外す）",
      "見学・体験で不安を解消し、\n確信に変える",
    ];
    dos.forEach((d, i) => {
      const y = 2.7 + i * 0.85;
      s.addImage({ data: I.check, x: rx + 0.3, y: y + 0.04, w: 0.26, h: 0.26 });
      s.addText(d, {
        x: rx + 0.66, y, w: rw - 0.96, h: 0.75, fontFace: F, fontSize: 11,
        color: MUTED, margin: 0, valign: "top", lineSpacing: 18,
      });
    });
    aiBar(s, 6.15, "ここが要点",
      "段階を飛ばして「④ 確信」だけ強化しても効きません。止まっている段階を特定してから手を打ちます。");
    s.addNotes("ファネルは提案書の中心概念。各段階の心理と打ち手をセットで覚えてもらう。");
  }

  /* ==================== P7 M1-2 段階別 × AI ==================== */
  {
    const s = pres.addSlide();
    s.background = { color: CARD };
    head(s, "MODULE 1", "段階別 ｜ やること × AI の使いどころ", "AI は「書く・調べる・数える」を担当。判断と現場対応は人が担当します");

    s.addTable([
      [th("段階"), th("求職者の心理"), th("企業がやること"), th("AI にやらせること")],
      ["① 認知", "「こんな施設があるんだ」", "検索で見つかる状態をつくる。\nSNS で現場を発信する。",
        { text: "求人検索で使われる言葉の洗い出し、\nSNS 投稿案を 10 本まとめて生成", options: { color: AI } }],
      ["② 比較", "「どうしてここなんだろう」", "理念・現場の魅力を言語化し、\n他施設との違いを示す。",
        { text: "近隣施設の求人文を並べ、\n自社にしかない要素を抽出させる", options: { color: AI } }],
      ["③ 行動", "「応募しても大丈夫そう」", "応募フォームを短くし、\n不安に先回りして答える。",
        { text: "応募をためらう理由を 20 個出させ、\nFAQ の下書きを作る", options: { color: AI } }],
      ["④ 確信", "「ここで働きたい」", "職場体験会で空気感を体感してもらう。",
        { text: "体験会の当日台本と、\n面談で聞く質問リストを作る", options: { color: AI } }],
    ], { ...tblOpts([1.15, 2.55, 3.6, 4.6]), y: 1.98, rowH: 0.72, fontSize: 10.5 });

    aiBar(s, 5.95, "AI に丸投げしない",
      "AI が出した文章は「たたき台」です。現場の言葉に直し、事実確認をしてから公開してください。");
    s.addNotes("AIの役割分担を明確にする。生成物は必ず現場確認を通す。");
  }

  /* ==================== P8 M1-3 ボトルネック診断 ==================== */
  {
    const s = pres.addSlide();
    s.background = { color: BG };
    head(s, "MODULE 1", "ワーク②：どこで止まっているかを特定する", "人数ではなく「率」で見ます。落ちている 1 か所だけを直します");

    const k = [
      { n: "①→②", t: "閲覧率", d: "求人が表示された回数のうち、\nクリックされた割合" },
      { n: "②→③", t: "応募率", d: "ページを見た人のうち、\n応募まで進んだ割合" },
      { n: "③→④", t: "参加率", d: "応募者のうち、見学・体験会に\n来てくれた割合" },
      { n: "④→入社", t: "承諾率", d: "内定を出した人のうち、\n承諾してくれた割合" },
    ];
    const cw = (CW - 1.05) / 4;
    k.forEach((x0, i) => {
      const x = M + i * (cw + 0.35);
      s.addShape(pres.ShapeType.roundRect, {
        x, y: 1.95, w: cw, h: 1.45, rectRadius: 0.06,
        fill: { color: CARD }, line: { color: LINE, width: 1 }, shadow: sh(),
      });
      s.addText(x0.n, {
        x: x + 0.22, y: 2.08, w: cw - 0.44, h: 0.3, fontFace: F, fontSize: 11, bold: true,
        color: TERRA, margin: 0, valign: "middle",
      });
      s.addText(x0.t, {
        x: x + 0.22, y: 2.38, w: cw - 0.44, h: 0.38, fontFace: F, fontSize: 16, bold: true,
        color: NAVY, margin: 0, valign: "middle",
      });
      s.addText(x0.d, {
        x: x + 0.22, y: 2.78, w: cw - 0.44, h: 0.55, fontFace: F, fontSize: 10,
        color: MUTED, margin: 0, valign: "top", lineSpacing: 15,
      });
    });

    s.addTable([
      [th("こんな症状が出ていたら"), th("止まっている段階"), th("まず直すところ")],
      ["求人がそもそも表示されない", "① 認知", "職種名・勤務地の書き方、掲載チャネルの数"],
      ["見られてはいるが応募が来ない", "② 比較", "キャッチコピーと「選ばれる理由」の中身"],
      ["応募フォームの途中で離脱する", "③ 行動", "入力項目の数、応募後の流れの説明不足"],
      ["面接には来るが辞退される", "④ 確信", "職場体験の有無、待遇の伝え方、返信の速さ"],
    ], { ...tblOpts([4.3, 2.4, 5.2]), y: 3.65, rowH: 0.56, fontSize: 11.5 });

    note(s, 6.55, "※ 同時に 2 か所以上を変えると、何が効いたのか分からなくなります。1 週間に 1 か所が原則です。", TERRA);
    s.addNotes("診断シート。症状から段階を逆引きできるようにしてある。");
  }

  /* ==================== P9 M2-1 0円採用の仕組み ==================== */
  {
    const s = pres.addSlide();
    s.background = { color: CARD };
    head(s, "MODULE 2", "0円採用の土台 ｜ Engage を軸に露出を回す", "自社で 1 つ求人をつくれば、主要な求人検索エンジンに無料で流れていきます");

    // source box
    s.addShape(pres.ShapeType.roundRect, {
      x: M, y: 2.1, w: 3.3, h: 2.2, rectRadius: 0.06, fill: { color: NAVY },
    });
    s.addText("自社採用ページ", {
      x: M + 0.25, y: 2.35, w: 2.8, h: 0.4, fontFace: F, fontSize: 17, bold: true,
      color: CARD, align: "center", margin: 0, valign: "middle",
    });
    s.addText("Engage（エンゲージ）", {
      x: M + 0.25, y: 2.75, w: 2.8, h: 0.35, fontFace: F, fontSize: 13, bold: true,
      color: TERRA, align: "center", margin: 0, valign: "middle",
    });
    s.addText("求人票の作成・最適化\n応募者管理まで無料", {
      x: M + 0.25, y: 3.2, w: 2.8, h: 0.8, fontFace: F, fontSize: 11.5,
      color: ICE, align: "center", margin: 0, valign: "top", lineSpacing: 19,
    });
    s.addShape(pres.ShapeType.rightArrow, {
      x: M + 3.5, y: 3.05, w: 0.65, h: 0.55, fill: { color: TERRA },
    });

    const outs = [
      { t: "Indeed", d: "国内最大の求人検索エンジン" },
      { t: "Google しごと検索", d: "検索結果の上部に表示" },
      { t: "求人ボックス 他", d: "主要アグリゲータに連携" },
    ];
    outs.forEach((o, i) => {
      const y = 2.1 + i * 0.78;
      s.addShape(pres.ShapeType.roundRect, {
        x: M + 4.35, y, w: 3.5, h: 0.64, rectRadius: 0.05,
        fill: { color: BG }, line: { color: NAVY, width: 1 },
      });
      s.addText(o.t, {
        x: M + 4.55, y: y + 0.05, w: 3.1, h: 0.3, fontFace: F, fontSize: 12.5, bold: true,
        color: NAVY, margin: 0, valign: "middle",
      });
      s.addText(o.d, {
        x: M + 4.55, y: y + 0.33, w: 3.1, h: 0.26, fontFace: F, fontSize: 10,
        color: MUTED, margin: 0, valign: "middle",
      });
    });
    s.addShape(pres.ShapeType.rightArrow, {
      x: M + 8.0, y: 3.05, w: 0.65, h: 0.55, fill: { color: TERRA },
    });
    s.addShape(pres.ShapeType.roundRect, {
      x: M + 8.85, y: 2.1, w: 3.05, h: 2.2, rectRadius: 0.06,
      fill: { color: TERRA_SOFT }, line: { color: TERRA, width: 1 },
    });
    s.addText("求職者の目に\n触れる", {
      x: M + 9.05, y: 2.5, w: 2.65, h: 0.8, fontFace: F, fontSize: 17, bold: true,
      color: NAVY, align: "center", margin: 0, valign: "middle", lineSpacing: 26,
    });
    s.addText("掲載料 0 円のまま\n露出が積み上がる", {
      x: M + 9.05, y: 3.35, w: 2.65, h: 0.7, fontFace: F, fontSize: 11.5,
      color: SLATE, align: "center", margin: 0, valign: "top", lineSpacing: 19,
    });

    s.addText("求人票に必ず入れる 3 つ", {
      x: M, y: 4.55, w: CW, h: 0.4, fontFace: F, fontSize: 15, bold: true,
      color: NAVY, margin: 0, valign: "middle",
    });
    const must = [
      { t: "理念・ミッション", d: "何のためにこの仕事をしているのか" },
      { t: "他施設との違い", d: "同じ地域の求人と何が違うのか" },
      { t: "働く環境の具体", d: "体制・シフト・研修・休日の実態" },
    ];
    const mw = (CW - 0.7) / 3;
    must.forEach((m, i) => {
      const x = M + i * (mw + 0.35);
      s.addShape(pres.ShapeType.roundRect, {
        x, y: 5.02, w: mw, h: 0.95, rectRadius: 0.05,
        fill: { color: BG }, line: { color: LINE, width: 1 },
      });
      s.addImage({ data: I.check, x: x + 0.25, y: 5.24, w: 0.26, h: 0.26 });
      s.addText(m.t, {
        x: x + 0.6, y: 5.1, w: mw - 0.85, h: 0.32, fontFace: F, fontSize: 13, bold: true,
        color: NAVY, margin: 0, valign: "middle",
      });
      s.addText(m.d, {
        x: x + 0.6, y: 5.42, w: mw - 0.85, h: 0.45, fontFace: F, fontSize: 10.5,
        color: MUTED, margin: 0, valign: "top", lineSpacing: 16,
      });
    });
    note(s, 6.2, "※「0円」は掲載料が 0 円という意味です。求人票を書き、写真を撮り、応募に対応する自社の工数は必ずかかります。", TERRA);
    s.addNotes("Engageは無料の自社採用ツール。0円の意味を正確に伝えることで、期待値のずれを防ぐ。");
  }

  /* ==================== P10 M2-2 コストから資産へ ==================== */
  {
    const s = pres.addSlide();
    s.background = { color: BG };
    head(s, "MODULE 2", "採用を「コスト」から「資産」に変える", "紹介会社は採るたびに払う。自社の仕組みは、つくれば残り続けます");

    s.addShape(pres.ShapeType.roundRect, {
      x: M, y: 1.95, w: 6.9, h: 4.0, rectRadius: 0.06,
      fill: { color: CARD }, line: { color: LINE, width: 1 }, shadow: sh(),
    });
    s.addChart(pres.ChartType.line, [
      { name: "紹介会社に依存（累計）", labels: ["1人", "2人", "3人", "4人", "5人", "6人"], values: [90, 180, 270, 360, 450, 540] },
      { name: "自社採用を内製（累計）", labels: ["1人", "2人", "3人", "4人", "5人", "6人"], values: [60, 72, 84, 96, 108, 120] },
    ], {
      x: M + 0.15, y: 2.15, w: 6.6, h: 3.6,
      chartColors: [TERRA, NAVY], lineSize: 3, lineDataSymbolSize: 7,
      showTitle: false, showLegend: true, legendPos: "b", legendFontFace: F, legendFontSize: 10.5, legendColor: SLATE,
      catAxisLabelColor: NAVY, catAxisLabelFontFace: F, catAxisLabelFontSize: 10.5,
      valAxisLabelColor: MUTED, valAxisLabelFontFace: F, valAxisLabelFontSize: 10,
      valAxisMinVal: 0, valAxisMaxVal: 600, valAxisMajorUnit: 150,
      valGridLine: { color: "EDEAE2", size: 1 }, catGridLine: { style: "none" },
    });
    s.addText("累計採用コストの推移（万円・試算例）", {
      x: M + 0.3, y: 2.0, w: 6.3, h: 0.3, fontFace: F, fontSize: 11, bold: true,
      color: NAVY, margin: 0, valign: "middle",
    });

    const rx = M + 7.2, rw = W - rx - M;
    s.addTable([
      [th("観点"), th("紹介会社に依存"), th("自社で内製")],
      ["費用の型", "変動費（採るたび）", { text: "固定費に近い", options: { bold: true, color: NAVY } }],
      ["人数が増えると", "比例して増える", { text: "1 人あたりが下がる", options: { bold: true, color: NAVY } }],
      ["社内に残るもの", "何も残らない", { text: "求人票・ページ・型", options: { bold: true, color: NAVY } }],
      ["立ち上げの速さ", "速い", "3 か月ほどかかる"],
      ["向いている場面", "急な欠員・専門職", "計画的な採用の主軸"],
    ], { x: rx, w: rw, colW: [1.55, 1.95, 1.6], y: 1.95, rowH: 0.53, fontFace: F, fontSize: 10.5,
         color: SLATE, valign: "middle", border: { type: "solid", color: LINE, pt: 1 }, align: "left", margin: 5 });

    s.addShape(pres.ShapeType.roundRect, {
      x: rx, y: 5.2, w: rw, h: 0.85, rectRadius: 0.06, fill: { color: NAVY },
    });
    s.addText("紹介会社をゼロにする必要はありません。\n主軸を内製に移し、紹介は緊急時の保険にします。", {
      x: rx + 0.22, y: 5.2, w: rw - 0.44, h: 0.85, fontFace: F, fontSize: 11,
      color: CARD, margin: 0, valign: "middle", lineSpacing: 17,
    });
    note(s, 6.15, "※ 内製側の初期 60 万円は、ページ制作・写真・動画・初期工数を含む試算例です。");
    s.addNotes("損益分岐は概ね2人目。ここを見せると経営判断が早くなる。");
  }

  /* ==================== P11 M3-1 採用ページ鉄板構成 ==================== */
  {
    const s = pres.addSlide();
    s.background = { color: CARD };
    head(s, "MODULE 3", "採用ページの鉄板構成 ｜ 6 ブロック", "告知の場ではなく、上から順に読ませる 1 本のストーリーとして組みます");

    const blocks = [
      { n: "1", t: "メインパネル（キャッチコピー）", d: "ターゲットが今かかえている状況と本音を言語化し、「これは自分向けの求人だ」と気づかせる。" },
      { n: "2", t: "悩みへの共感", d: "「毎日記録に追われている」「今の職場ではスキルが活かせない」など、不満をこちらから言葉にする。" },
      { n: "3", t: "本当の原因と解決策", d: "なぜその悩みが起きるのか（雑務の多さ・担当業務の広さ）を明かし、自社での解決策を具体的に示す。" },
      { n: "4", t: "どんなふうに働けるか", d: "1 日のスケジュール、研修制度、キャリアの道すじを見せ、入社後の姿を想像できるようにする。" },
      { n: "5", t: "スタッフの紹介・声（動画）", d: "30〜40 秒のインタビュー動画。表情や声色といった、文字では伝わらない空気感を届ける。" },
      { n: "6", t: "数字で見える会社", d: "年間休日、平均年齢、勤続年数、有給取得率。客観的な数字が最後の安心材料になります。" },
    ];
    const bw = (CW - 0.45) / 2, bh = 1.28;
    blocks.forEach((b, i) => {
      const x = M + (i % 2) * (bw + 0.45);
      const y = 2.0 + Math.floor(i / 2) * (bh + 0.28);
      s.addShape(pres.ShapeType.roundRect, {
        x, y, w: bw, h: bh, rectRadius: 0.05,
        fill: { color: BG }, line: { color: LINE, width: 1 },
      });
      s.addShape(pres.ShapeType.ellipse, {
        x: x + 0.28, y: y + 0.28, w: 0.55, h: 0.55, fill: { color: NAVY },
      });
      s.addText(b.n, {
        x: x + 0.28, y: y + 0.28, w: 0.55, h: 0.55, fontFace: F, fontSize: 16, bold: true,
        color: CARD, align: "center", valign: "middle", margin: 0,
      });
      s.addText(b.t, {
        x: x + 1.0, y: y + 0.18, w: bw - 1.3, h: 0.36, fontFace: F, fontSize: 14, bold: true,
        color: NAVY, margin: 0, valign: "middle",
      });
      s.addText(b.d, {
        x: x + 1.0, y: y + 0.55, w: bw - 1.3, h: 0.62, fontFace: F, fontSize: 10.5,
        color: MUTED, margin: 0, valign: "top", lineSpacing: 16,
      });
    });
    note(s, 6.7, "※ 上から 1→6 の順に並べます。順番を入れ替えると、共感が生まれる前に条件の話が始まってしまいます。", TERRA);
    s.addNotes("6ブロックは提案書の中核。順番そのものが設計であることを強調する。");
  }

  /* ==================== P12 M3-2 AIプロンプトの型 ==================== */
  {
    const s = pres.addSlide();
    s.background = { color: BG };
    head(s, "MODULE 3", "AI で原稿をつくる ｜ プロンプトの型", "この 5 つを埋めて渡すだけで、たたき台の質が大きく変わります");

    const parts = [
      ["① 役割", "「介護業界の採用コピーライターとして」"],
      ["② 前提", "理念・体制・シフト・研修を箇条書きで渡す"],
      ["③ 相手", "誰に読ませたいか（例：記録に疲れた 30 代職員）"],
      ["④ 形式", "「キャッチコピー 10 案、25 字以内」と形を指定"],
      ["⑤ 制約", "「誇張表現は使わない」「事実にない数字は書かない」"],
    ];
    const lw = 5.5;
    parts.forEach((p, i) => {
      const y = 1.98 + i * 0.7;
      s.addShape(pres.ShapeType.roundRect, {
        x: M, y, w: lw, h: 0.6, rectRadius: 0.05,
        fill: { color: CARD }, line: { color: LINE, width: 1 },
      });
      s.addText(p[0], {
        x: M + 0.2, y, w: 0.85, h: 0.6, fontFace: F, fontSize: 12.5, bold: true,
        color: TERRA, margin: 0, valign: "middle",
      });
      s.addText(p[1], {
        x: M + 1.1, y, w: lw - 1.3, h: 0.6, fontFace: F, fontSize: 11,
        color: SLATE, margin: 0, valign: "middle",
      });
    });

    const rx = M + lw + 0.5, rw = W - rx - M;
    s.addShape(pres.ShapeType.roundRect, {
      x: rx, y: 1.98, w: rw, h: 3.42, rectRadius: 0.06, fill: { color: NAVY_DK },
    });
    s.addText("記入例（そのまま使えます）", {
      x: rx + 0.3, y: 2.13, w: rw - 0.6, h: 0.35, fontFace: F, fontSize: 12.5, bold: true,
      color: TERRA, margin: 0, valign: "middle",
    });
    s.addText(
      "あなたは介護業界の採用コピーライターです。\n\n" +
      "【施設】訪問介護・スタッフ 28 名・年間休日 118 日\n" +
      "　記録は音声入力に切替済み／残業は月平均 4 時間\n" +
      "【読み手】記録と残業に疲れた 30 代の介護福祉士\n" +
      "【出力】求人ページのキャッチコピーを 10 案、\n" +
      "　各 25 字以内。悩みを言い当てる形にする。\n" +
      "【制約】事実にない数字は書かない。\n" +
      "　「アットホーム」など曖昧な言葉は使わない。",
      { x: rx + 0.3, y: 2.55, w: rw - 0.6, h: 2.7, fontFace: F, fontSize: 11,
        color: "D9E2EE", margin: 0, valign: "top", lineSpacing: 18 });

    s.addText("出てきた原稿のチェック 3 点", {
      x: M, y: 5.6, w: 5.5, h: 0.35, fontFace: F, fontSize: 13, bold: true,
      color: NAVY, margin: 0, valign: "middle",
    });
    const chk = ["書かれた数字は事実か", "現場の人が読んで違和感がないか", "他施設でも成立する文章になっていないか"];
    chk.forEach((c, i) => {
      const y = 5.98 + i * 0.32;
      s.addImage({ data: I.checkG, x: M, y: y + 0.02, w: 0.23, h: 0.23 });
      s.addText(c, {
        x: M + 0.33, y, w: 5.2, h: 0.3, fontFace: F, fontSize: 11,
        color: SLATE, margin: 0, valign: "middle",
      });
    });
    s.addShape(pres.ShapeType.roundRect, {
      x: rx, y: 5.6, w: rw, h: 1.0, rectRadius: 0.06,
      fill: { color: AI_SOFT }, line: { color: AI, width: 1 },
    });
    s.addText("3 番目のチェックが最重要です。他施設に貼り替えても通る文章は、\n求職者にとって「選ぶ理由」になりません。", {
      x: rx + 0.28, y: 5.6, w: rw - 0.56, h: 1.0, fontFace: F, fontSize: 11, bold: true,
      color: SLATE, margin: 0, valign: "middle", lineSpacing: 18,
    });
    s.addNotes("プロンプトの型は5要素。制約条件を必ず入れることで、誇張表現とハルシネーションを抑える。");
  }

  /* ==================== P13 M3-3 ペルソナ設計 ==================== */
  {
    const s = pres.addSlide();
    s.background = { color: CARD };
    head(s, "MODULE 3", "ワーク③：ペルソナと「介護職の本音」", "共感は想像では書けません。実際に出ている声を材料にします");

    const lw = 5.2;
    s.addShape(pres.ShapeType.roundRect, {
      x: M, y: 1.98, w: lw, h: 4.2, rectRadius: 0.06,
      fill: { color: BG }, line: { color: LINE, width: 1 },
    });
    s.addText("採用要件は 1 枚に絞る", {
      x: M + 0.32, y: 2.15, w: lw - 0.64, h: 0.4, fontFace: F, fontSize: 15, bold: true,
      color: NAVY, margin: 0, valign: "middle",
    });
    const rows = [
      ["MUST", "3 つまで", "資格・経験年数など、無いと成立しない条件", TERRA],
      ["WANT", "自由に", "あれば嬉しい。無くても採用する条件", NAVY],
      ["NG", "2 つまで", "これがあったら見送る、と決めておく条件", NAVY],
    ];
    rows.forEach((r, i) => {
      const y = 2.65 + i * 1.08;
      s.addShape(pres.ShapeType.roundRect, {
        x: M + 0.32, y, w: lw - 0.64, h: 0.92, rectRadius: 0.05,
        fill: { color: CARD }, line: { color: LINE, width: 1 },
      });
      s.addText(r[0], {
        x: M + 0.5, y, w: 1.1, h: 0.92, fontFace: F, fontSize: 15, bold: true,
        color: r[3], margin: 0, valign: "middle",
      });
      s.addText(r[1], {
        x: M + 1.6, y: y + 0.14, w: lw - 1.95, h: 0.32, fontFace: F, fontSize: 12.5, bold: true,
        color: NAVY, margin: 0, valign: "middle",
      });
      s.addText(r[2], {
        x: M + 1.6, y: y + 0.46, w: lw - 1.95, h: 0.36, fontFace: F, fontSize: 10.5,
        color: MUTED, margin: 0, valign: "middle",
      });
    });
    s.addText("MUST を 3 つに絞るほど、会える人は増えます。", {
      x: M + 0.32, y: 5.75, w: lw - 0.64, h: 0.35, fontFace: F, fontSize: 11, bold: true,
      color: TERRA, margin: 0, valign: "middle",
    });

    const rx = M + lw + 0.5, rw = W - rx - M;
    s.addText("転職を考える介護職の「本音」", {
      x: rx, y: 2.15, w: rw, h: 0.4, fontFace: F, fontSize: 15, bold: true,
      color: NAVY, margin: 0, valign: "middle",
    });
    const voices = [
      ["記録と事務に追われて、利用者と向き合う時間がない", "→ 記録の効率化・間接業務の削減を示す"],
      ["人間関係が読めない。入ってみないと分からない", "→ 職場体験会とスタッフ動画で先に見せる"],
      ["シフトが急に変わる。休みの予定が立てられない", "→ シフトの決め方と年間休日を数字で示す"],
      ["がんばっても評価されない。給与が上がらない", "→ 評価基準とキャリアの道すじを明記する"],
      ["自分のスキルがこの職場では活かせていない", "→ 任せたい役割を具体的に書く"],
    ];
    voices.forEach((v, i) => {
      const y = 2.62 + i * 0.73;
      s.addShape(pres.ShapeType.roundRect, {
        x: rx, y, w: rw, h: 0.63, rectRadius: 0.05,
        fill: { color: BG }, line: { color: LINE, width: 1 },
      });
      s.addText("「" + v[0] + "」", {
        x: rx + 0.22, y: y + 0.04, w: rw - 0.44, h: 0.3, fontFace: F, fontSize: 11.5, bold: true,
        color: SLATE, margin: 0, valign: "middle",
      });
      s.addText(v[1], {
        x: rx + 0.22, y: y + 0.33, w: rw - 0.44, h: 0.26, fontFace: F, fontSize: 10.5,
        color: TERRA, margin: 0, valign: "middle",
      });
    });
    note(s, 6.35, "※ 本音は自社の退職面談・面接メモから集めるのが最も正確です。AI には整理と分類をさせます。");
    s.addNotes("共感パートの材料集め。実データ（退職面談メモ）を起点にするのが精度の決め手。");
  }

  /* ==================== P14 M4-1 職場体験会 ==================== */
  {
    const s = pres.addSlide();
    s.background = { color: BG };
    head(s, "MODULE 4", "体験型選考 ｜ 職場体験会のつくり方", "求職者の最大の不安は「入ってみないと分からない」。それを先に解消します");

    const steps = [
      { t: "① 出迎え", m: "10分", d: "採用担当だけでなく、\n一緒に働く現場スタッフが出迎える" },
      { t: "② 現場を歩く", m: "30分", d: "挨拶、笑顔、\n利用者との関わり。\n作り込まない普段の姿" },
      { t: "③ 体験・同行", m: "40分", d: "実際の業務を\n一部体験してもらう。\n記録画面も触る" },
      { t: "④ 本音の面談", m: "30分", d: "条件の説明より、\n不安の聞き取り。\nその場で答える" },
      { t: "⑤ 当日中に連絡", m: "—", d: "お礼と次の案内を\n当日中に送る。\n迷う間に他社が決まる" },
    ];
    const cw = (CW - 1.0) / 5;
    steps.forEach((st, i) => {
      const x = M + i * (cw + 0.25);
      s.addShape(pres.ShapeType.roundRect, {
        x, y: 1.95, w: cw, h: 2.55, rectRadius: 0.06,
        fill: { color: CARD }, line: { color: LINE, width: 1 }, shadow: sh(),
      });
      s.addShape(pres.ShapeType.roundRect, {
        x: x + 0.22, y: 2.15, w: cw - 0.44, h: 0.34, rectRadius: 0.05,
        fill: { color: i === 4 ? TERRA : NAVY },
      });
      s.addText(st.m, {
        x: x + 0.22, y: 2.15, w: cw - 0.44, h: 0.34, fontFace: F, fontSize: 10.5, bold: true,
        color: CARD, align: "center", valign: "middle", margin: 0,
      });
      s.addText(st.t, {
        x: x + 0.22, y: 2.58, w: cw - 0.44, h: 0.42, fontFace: F, fontSize: 15, bold: true,
        color: NAVY, margin: 0, valign: "middle",
      });
      s.addText(st.d, {
        x: x + 0.22, y: 3.02, w: cw - 0.44, h: 1.3, fontFace: F, fontSize: 10.5,
        color: MUTED, margin: 0, valign: "top", lineSpacing: 17,
      });
    });

    const lw2 = (CW - 0.45) / 2;
    s.addShape(pres.ShapeType.roundRect, {
      x: M, y: 4.75, w: lw2, h: 1.55, rectRadius: 0.06,
      fill: { color: NAVY }, line: { color: NAVY, width: 1 },
    });
    s.addText("必ず見せる 3 つ", {
      x: M + 0.3, y: 4.9, w: lw2 - 0.6, h: 0.35, fontFace: F, fontSize: 13.5, bold: true,
      color: TERRA, margin: 0, valign: "middle",
    });
    s.addText("・スタッフ同士の会話（作らない、普段のまま）\n・利用者との関わり方\n・記録や申し送りの実際の運用画面", {
      x: M + 0.3, y: 5.28, w: lw2 - 0.6, h: 0.95, fontFace: F, fontSize: 11.5,
      color: CARD, margin: 0, valign: "top", lineSpacing: 19,
    });
    s.addShape(pres.ShapeType.roundRect, {
      x: M + lw2 + 0.45, y: 4.75, w: lw2, h: 1.55, rectRadius: 0.06,
      fill: { color: CARD }, line: { color: LINE, width: 1 },
    });
    s.addText("やってはいけない 3 つ", {
      x: M + lw2 + 0.75, y: 4.9, w: lw2 - 0.6, h: 0.35, fontFace: F, fontSize: 13.5, bold: true,
      color: TERRA, margin: 0, valign: "middle",
    });
    s.addText("・当日だけ特別にきれいにする\n・採用担当が最後まで付きっきりで説明する\n・条件面の話だけで時間を使い切る", {
      x: M + lw2 + 0.75, y: 5.28, w: lw2 - 0.6, h: 0.95, fontFace: F, fontSize: 11.5,
      color: MUTED, margin: 0, valign: "top", lineSpacing: 19,
    });
    note(s, 6.45, "※ 体験会は「選考」ではなく「相互確認の場」と伝えると、参加のハードルが大きく下がります。");
    s.addNotes("体験会の時間配分は目安。作り込まないことが最大のポイント。");
  }

  /* ==================== P15 M4-2 スタッフ動画 ==================== */
  {
    const s = pres.addSlide();
    s.background = { color: CARD };
    head(s, "MODULE 4", "スタッフ動画 ｜ 30〜40 秒でつくる", "文字では伝わらない「空気感」を運ぶ、いちばん効率のいい素材です");

    const st = [
      { ic: I.video, t: "スマホ 1 台でいい", d: "三脚とピンマイクだけ用意。\n照明は窓際の自然光で十分です。\n背景は実際の職場を写します。" },
      { ic: I.users, t: "台本は書かない", d: "質問を投げて答えてもらう形式に。\n言い直しはそのまま残したほうが\nかえって信用されます。" },
      { ic: I.file, t: "字幕は必ず入れる", d: "求職者の多くは音を出さずに見ます。\n字幕がないと、内容が\nまったく届きません。" },
    ];
    const cw = (CW - 0.9) / 3;
    st.forEach((c, i) => {
      const x = M + i * (cw + 0.45);
      s.addShape(pres.ShapeType.roundRect, {
        x, y: 1.98, w: cw, h: 2.35, rectRadius: 0.06,
        fill: { color: BG }, line: { color: LINE, width: 1 },
      });
      s.addShape(pres.ShapeType.ellipse, { x: x + 0.32, y: 2.22, w: 0.72, h: 0.72, fill: { color: TERRA_SOFT } });
      s.addImage({ data: c.ic, x: x + 0.5, y: 2.4, w: 0.36, h: 0.36 });
      s.addText(c.t, {
        x: x + 0.32, y: 3.05, w: cw - 0.64, h: 0.4, fontFace: F, fontSize: 15, bold: true,
        color: NAVY, margin: 0, valign: "middle",
      });
      s.addText(c.d, {
        x: x + 0.32, y: 3.48, w: cw - 0.64, h: 0.75, fontFace: F, fontSize: 11,
        color: MUTED, margin: 0, valign: "top", lineSpacing: 17,
      });
    });

    const lw = 6.4;
    s.addText("そのまま使える質問 5 つ", {
      x: M, y: 4.5, w: lw, h: 0.4, fontFace: F, fontSize: 14, bold: true,
      color: NAVY, margin: 0, valign: "middle",
    });
    const qs = [
      "入る前に不安だったことは何でしたか？",
      "実際に入ってみて、その不安はどうなりましたか？",
      "この職場で「いいな」と思う瞬間はいつですか？",
      "1 日のうち、いちばん好きな時間は？",
      "どんな人と一緒に働きたいですか？",
    ];
    qs.forEach((q, i) => {
      const y = 4.92 + i * 0.35;
      s.addText("Q" + (i + 1), {
        x: M, y, w: 0.45, h: 0.32, fontFace: F, fontSize: 11, bold: true,
        color: TERRA, margin: 0, valign: "middle",
      });
      s.addText(q, {
        x: M + 0.5, y, w: lw - 0.5, h: 0.32, fontFace: F, fontSize: 11.5,
        color: SLATE, margin: 0, valign: "middle",
      });
    });

    const rx = M + lw + 0.5, rw = W - rx - M;
    s.addShape(pres.ShapeType.roundRect, {
      x: rx, y: 4.5, w: rw, h: 2.15, rectRadius: 0.06,
      fill: { color: AI_SOFT }, line: { color: AI, width: 1 },
    });
    s.addImage({ data: I.cpuT, x: rx + 0.3, y: 4.72, w: 0.32, h: 0.32 });
    s.addText("編集は AI に任せる", {
      x: rx + 0.72, y: 4.72, w: rw - 1.0, h: 0.32, fontFace: F, fontSize: 13.5, bold: true,
      color: AI, margin: 0, valign: "middle",
    });
    s.addText(
      "① 撮った動画を文字起こしする\n" +
      "② 一番いい 30〜40 秒をどこか選ばせる\n" +
      "③ 字幕テキストを整える（言い間違いだけ直す）\n" +
      "④ 求人ページ用の紹介文を 3 案つくらせる",
      { x: rx + 0.3, y: 5.15, w: rw - 0.6, h: 1.35, fontFace: F, fontSize: 11,
        color: SLATE, margin: 0, valign: "top", lineSpacing: 19 });
    s.addNotes("動画は最も費用対効果が高い素材。作り込まず、字幕を必ず付ける。");
  }

  /* ==================== P16 M5 運用 ==================== */
  {
    const s = pres.addSlide();
    s.background = { color: BG };
    head(s, "MODULE 5", "毎週 15 分で回す ｜ 運用ダッシュボード", "つくって終わりにしないための、いちばん短い会議の型");

    s.addTable([
      [th("見る数字"), th("どこで取るか"), th("目安"), th("下がっていたら直すところ")],
      ["求人の表示回数", "Engage / Indeed の管理画面", "前週比 ±20% 以内", "職種名と勤務地の書き方、掲載チャネルの数"],
      ["ページの閲覧数", "Engage の管理画面", "表示の 3〜5%", "キャッチコピー（1 行目で決まります）"],
      ["応募数", "Engage の応募者管理", "閲覧の 2〜5%", "応募フォームの項目数、共感パートの中身"],
      ["体験会の参加率", "自社の記録", "応募の 50% 以上", "案内メールの文面、日程の選択肢の少なさ"],
      ["内定の承諾率", "自社の記録", "70% 以上", "返信の速さ、条件の伝え方、体験会の質"],
    ], { ...tblOpts([2.15, 3.0, 2.05, 4.7]), y: 2.0, rowH: 0.6, fontSize: 11 });

    s.addShape(pres.ShapeType.roundRect, {
      x: M, y: 5.8, w: CW, h: 1.0, rectRadius: 0.06, fill: { color: NAVY },
    });
    s.addText([
      { text: "週次ミーティング 15 分の型　", options: { bold: true, color: TERRA, fontSize: 13, fontFace: F } },
      { text: "①数字を読み上げる（3 分）→ ②いちばん落ちている 1 か所を選ぶ（2 分）→ ③その 1 か所への対策を決める（7 分）→ ④担当と期限を決める（3 分）",
        options: { color: CARD, fontSize: 11.5, fontFace: F } },
    ], { x: M + 0.35, y: 5.8, w: CW - 0.7, h: 1.0, margin: 0, valign: "middle", lineSpacing: 20 });
    note(s, 6.88, "※ 目安の数値は一般的なレンジです。2〜3 か月運用して、自社の平常値に置き換えてください。");
    s.addNotes("運用が続くかどうかは会議の短さで決まる。15分・1か所主義。");
  }

  /* ==================== P17 AI活用マップ ==================== */
  {
    const s = pres.addSlide();
    s.background = { color: CARD };
    head(s, null, "AI 活用マップ ｜ どこを任せ、どこを人がやるか", "AI は作業を速くする道具です。判断と現場の関係づくりは人の仕事のままです");

    s.addTable([
      [th("工程"), th("AI に任せること"), th("人がやること"), th("時間の目安")],
      ["ペルソナ設計", "退職面談メモの分類・要約", "どの層を狙うかの決定", "3 時間 → 1 時間"],
      ["求人票づくり", "キャッチコピー案の量産、表現の統一", "事実確認、現場の言葉への修正", "8 時間 → 3 時間"],
      ["採用ページ", "6 ブロックの下書き、FAQ の生成", "理念パートの執筆、写真の選定", "20 時間 → 8 時間"],
      ["スカウト・案内文", "個別文面の下書き、日程調整文", "送る相手の選定、最終確認", "5 時間 → 1 時間"],
      ["動画", "文字起こし、字幕整形、紹介文案", "撮影、話し手の選定", "6 時間 → 3 時間"],
      ["週次の分析", "数値の集計と要約、変化点の指摘", "打ち手の決定、担当の割り当て", "2 時間 → 20 分"],
    ], { ...tblOpts([2.0, 4.15, 3.75, 2.0]), y: 1.72, rowH: 0.55, fontSize: 10.5 });

    aiBar(s, 5.85, "使うときの原則",
      "求職者の個人情報や利用者に関する情報は AI に入力しないでください。渡すのは公開できる自社情報だけにします。");
    note(s, 6.8, "※ 時間の目安は 1 ポジションあたりの想定です。");
    s.addNotes("AI活用の全体像。個人情報の取り扱いは必ず釘を刺す。");
  }

  /* ==================== P18 90日ロードマップ ==================== */
  {
    const s = pres.addSlide();
    s.background = { color: NAVY_DK };
    s.addShape(pres.ShapeType.ellipse, { x: -2.2, y: 5.0, w: 5.0, h: 5.0, fill: { color: NAVY } });
    s.addText("90 日ロードマップ", {
      x: M, y: 0.5, w: CW, h: 0.7, fontFace: F, fontSize: 30, bold: true,
      color: CARD, margin: 0, valign: "middle",
    });
    s.addText("まずは 1 ポジションだけで型をつくり、うまくいったやり方を他へ広げます。", {
      x: M, y: 1.18, w: CW, h: 0.4, fontFace: F, fontSize: 13.5,
      color: ICE, margin: 0, valign: "middle",
    });

    const ph = [
      { p: "PHASE 1", d: "1〜30 日", t: "測る・決める", b: "・採用単価と定着率を出す\n・ファネルのボトルネックを特定\n・ペルソナと MUST / NG を確定\n・Engage のアカウントを開設" },
      { p: "PHASE 2", d: "31〜60 日", t: "つくる", b: "・採用ページを 6 ブロックで作成\n・スタッフ動画を 2 本撮影\n・求人票を公開し、露出を開始\n・職場体験会の当日台本を用意" },
      { p: "PHASE 3", d: "61〜90 日", t: "回す・直す", b: "・週次 15 分の会議を開始\n・体験会を月 2 回のペースで実施\n・落ちている 1 か所を毎週改善\n・単価を初月の数字と比較する" },
    ];
    const cw = (CW - 0.9) / 3;
    ph.forEach((k, i) => {
      const x = M + i * (cw + 0.45);
      s.addShape(pres.ShapeType.roundRect, {
        x, y: 1.85, w: cw, h: 3.35, rectRadius: 0.06, fill: { color: CARD },
      });
      s.addText([
        { text: k.p, options: { bold: true, color: TERRA, fontSize: 12, fontFace: F, charSpacing: 1 } },
        { text: "　" + k.d, options: { color: MUTED, fontSize: 11, fontFace: F } },
      ], { x: x + 0.32, y: 2.02, w: cw - 0.64, h: 0.35, margin: 0, valign: "middle" });
      s.addText(k.t, {
        x: x + 0.32, y: 2.42, w: cw - 0.64, h: 0.5, fontFace: F, fontSize: 21, bold: true,
        color: NAVY, margin: 0, valign: "middle",
      });
      s.addText(k.b, {
        x: x + 0.32, y: 2.98, w: cw - 0.64, h: 2.0, fontFace: F, fontSize: 12,
        color: MUTED, margin: 0, valign: "top", lineSpacing: 23,
      });
    });

    s.addShape(pres.ShapeType.roundRect, {
      x: M, y: 5.45, w: CW, h: 1.0, rectRadius: 0.06,
      fill: { color: NAVY }, line: { color: TERRA, width: 1 },
    });
    s.addText([
      { text: "明日やる 3 つ　", options: { bold: true, color: TERRA, fontSize: 13.5, fontFace: F } },
      { text: "① 昨年の採用人数と費用を経理から取り寄せる　②「入る前に不安だったこと」を現場スタッフ 3 人に聞く　③ Engage のアカウントを開設する",
        options: { color: CARD, fontSize: 12, fontFace: F } },
    ], { x: M + 0.35, y: 5.45, w: CW - 0.7, h: 1.0, margin: 0, valign: "middle", lineSpacing: 20 });

    s.addText("採用は「才能」ではなく「手順」です。90 日で、御社の型がひとつ完成します。", {
      x: M, y: 6.6, w: CW, h: 0.5, fontFace: F, fontSize: 14, bold: true,
      color: CARD, align: "center", valign: "middle", margin: 0,
    });
    s.addNotes("最後は必ず「明日やる3つ」まで落とす。ここまで具体化しないと動き出さない。");
  }

  await pres.writeFile({ fileName: process.argv[2] || "course.pptx" });
  console.log("written", pres.slides ? "" : "");
})();
