export function toUserFriendlyError(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === 'QuotaExceededError') {
      return 'この端末に保存できる容量を超えました。不要な画像を減らしてからもう一度お試しください。'
    }
    if (error.name === 'NotAllowedError') {
      return '操作が許可されませんでした。ブラウザの設定を確認してからもう一度お試しください。'
    }
    if (error.name === 'AbortError') {
      return '操作がキャンセルされました。'
    }
  }

  if (error instanceof Error) {
    if (/quota/i.test(error.message)) {
      return 'この端末に保存できる容量を超えました。不要な画像を減らしてからもう一度お試しください。'
    }
    if (/heic|heif/i.test(error.message)) {
      return 'この画像形式には現在対応していません。PNG、JPEG、WebPを使用してください。'
    }
  }

  return '処理中に問題が発生しました。もう一度お試しください。'
}
