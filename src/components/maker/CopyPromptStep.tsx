/**
 * 将来：Creators Market のタイトル・スタンプ説明文向けプロンプト生成
 * いまは枠だけ用意する
 */
export function CopyPromptStep() {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>タイトル・説明文</h2>
        <p>準備中の機能です</p>
      </div>
      <p>
        ZIPを作ったあと、Creators Market に載せるタイトルやスタンプ説明文を考えるための
        プロンプト生成を、ここに追加する予定です。
      </p>
      <p className="hint">いまはZIPのアップロードを先に進めてください。</p>
      <p>
        <a href="https://creator.line.me/signup/line_auth" target="_blank" rel="noreferrer">
          Creators Marketへ進む
        </a>
      </p>
    </section>
  )
}
