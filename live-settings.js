// ライブ情報の管理シート（公開CSV）。通常、このURLは変更不要。
// 取得に失敗したときは、live.htmlに書いた公演情報を表示する。
const LIVE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQitZGns9avfLITns_H8GLltXt_EN9n3Rlo4Xjd6ayi4pwDrmpNa1sCjOaxBtDAfLuKguPXfA4ZQSiY/pub?output=csv';

// CSVのカンマ・改行・引用符を読み取る（セル内の改行にも対応）。
function readCSV(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { cell += '"'; i++; }
      else quoted = !quoted;
    } else if (!quoted && (char === ',' || char === '\n')) {
      row.push(cell.replace(/\r$/, '')); cell = '';
      if (char === '\n') { rows.push(row); row = []; }
    } else cell += char;
  }
  if (quoted) throw new Error('CSVの引用符が閉じていません');
  row.push(cell.replace(/\r$/, ''));
  rows.push(row);
  return rows.filter(row => row.some(cell => cell.trim()));
}

async function updateLiveSchedule() {
  if (!LIVE_SHEET_URL) return;
  try {
    const source = new URL(LIVE_SHEET_URL);
    if (source.protocol !== 'https:' || source.hostname !== 'docs.google.com') {
      throw new Error('Googleスプレッドシートの公開URLを指定してください');
    }
    const response = await fetch(source, { signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error('ライブ情報を取得できませんでした');
    const [columns, ...rows] = readCSV((await response.text()).replace(/^\uFEFF/, ''));
    const keys = ['日付', '会場', '開場', '開演', '前売り', 'U-22', '予約URL', 'ボタン名'];
    if (!columns || keys.some((key, i) => columns[i] !== key)) {
      throw new Error('シートの見出しを確認してください');
    }
    const template = document.querySelector('.event');
    const events = rows.map(row => {
      const [date, venue, open, start, price, youth, url, label] = row;
      const parsed = new Date(date + 'T00:00:00Z');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(+parsed) ||
          parsed.toISOString().slice(0, 10) !== date || !venue ||
          ![open, start].every(time => /^([01]\d|2[0-3]):[0-5]\d$/.test(time)) ||
          !price || !youth || !label || !/^https?:$/.test(new URL(url).protocol)) {
        throw new Error('公演情報の入力を確認してください');
      }
      // 既存のHTMLを型にして、文字だけを入れ替える。
      const event = template.cloneNode(true);
      const [year, month, day] = date.split('-');
      const dayLabel = document.createElement('span');
      dayLabel.textContent = `${Number(month)} / ${Number(day)}`;
      const dateLabel = event.querySelector('.event-date');
      dateLabel.dateTime = date;
      dateLabel.replaceChildren(year, dayLabel);
      event.querySelector('.event-title').textContent = venue;
      event.querySelectorAll('.event-details time').forEach((time, i) => {
        time.textContent = [open, start][i];
        time.dateTime = `${date}T${time.textContent}:00+09:00`;
      });
      event.querySelectorAll('.event-details dd')[1].replaceChildren(
        `前売り ${price}`, document.createElement('br'), `U-22 ${youth}`
      );
      const link = event.querySelector('.reserve-link');
      link.href = url;
      link.textContent = `${label} ↗`;
      return event;
    });
    // 全件を確認してから置き換える。空のシートなら公演なしを表示する。
    const list = document.getElementById('live-events');
    if (events.length) list.replaceChildren(...events);
    else {
      const message = document.createElement('p');
      message.textContent = '次のライブは、決まり次第お知らせします。';
      list.replaceChildren(message);
    }
  } catch (error) {
    console.warn('ライブ情報を更新できなかったため、掲載済みの情報を表示します。', error);
  }
}

updateLiveSchedule();
