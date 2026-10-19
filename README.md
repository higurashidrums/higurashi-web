# 更新のしかた


| ファイル | 内容 |
| --- | --- |
| `index.html` | トップの写真・紹介映像・紹介文・作品一覧・ページへの案内 |
| `live.html` | ライブ予定・時間・料金・予約ボタン |
| `booking.html` | 出演依頼の入力欄とメール下書き・コピー |
| `stories.html` | 楽曲の物語 |
| `header.html` | 全ページ共通のロゴ・SNS・ページ移動リンク |
| `shared-style.css` | 全ページ共通の色・文字・ヘッダーの見た目 |
| `_config.yml` | GitHub Pagesの公開設定 |
| `assets` | 写真・ジャケット・手書き文字の元画像・動画 |

## ライブの追加・変更・削除

`live.html`の「1公演ここから」から「1公演ここまで」をコピーして追加

- 年月日、画面に出る日付、`datetime`の日付をそろえる。
- 会場名、開場・開演時刻、料金、予約URL、ボタン名を書き換える。
- 時刻の`datetime`は`2026-10-24T13:10:00+09:00`の形
- 終了した公演は、そのブロックを削除する
- 公演がなくなったら、`<p>次のライブは、決まり次第お知らせします。</p>`

## 曲の追加

`index.html`の`release-list`内で、`<article class="release-card">`から対応する`</article>`までをコピー

曲名、日付（`datetime`と表示日付の両方）、ジャケット画像のパスと説明、配信URLを変更。配信URLはジャケットと「音楽を聴く」の2か所。

`story-link`のリンクをつける

## 物語の追加

`stories.html`の`<article class="story" ...>`を丸ごとコピーし、本文と曲の配信URLを書き換える

- `id`を重複しない名前にする（例：`new-song`）。
- 見出しの`id`（例：`title-new-song`）と記事の`aria-labelledby`を一致させる。
- 上のナビに`<a href="#new-song">曲名</a>`を追加する。
- トップの「物語を読む」も`stories.html#new-song`へつなぐ。
