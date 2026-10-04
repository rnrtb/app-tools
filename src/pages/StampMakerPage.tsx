import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ImagePicker } from '../components/maker/ImagePicker'
import { SpecialImageSection } from '../components/maker/SpecialImageSection'
import { StampList } from '../components/maker/StampList'
import { TransformEditor } from '../components/maker/TransformEditor'
import { ValidationPanel } from '../components/maker/ValidationPanel'
import { ZipExport } from '../components/maker/ZipExport'
import { PREVIEW_BACKGROUND_OPTIONS } from '../constants/previewBackground'
import { getStampSpec } from '../config/stampSpecs'
import { useStampProject } from '../hooks/useStampProject'
import { getCountStatus } from '../lib/validation/validate'

export function StampMakerPage() {
  const {
    project,
    ready,
    restoreAvailable,
    continueRestore,
    startFresh,
    saveStatus,
    saveError,
    actionError,
    setActionError,
    undo,
    undoRemove,
    addFiles,
    replaceStamp,
    removeStamp,
    reorderStamps,
    updateStampTransform,
    setPreviewBackground,
    setZipName,
    selectMainFromStamp,
    selectTabFromStamp,
    uploadMain,
    uploadTab,
    updateMainTransform,
    updateTabTransform,
  } = useStampProject()

  const [editingId, setEditingId] = useState<string | null>(null)
  const spec = getStampSpec()
  const countStatus = getCountStatus(project.stamps.length)
  const editingStamp = project.stamps.find((s) => s.id === editingId) ?? null

  if (!ready) {
    return (
      <main className="page">
        <p>読み込み中…</p>
      </main>
    )
  }

  if (restoreAvailable) {
    return (
      <main className="page">
        <section className="restore-card">
          <h1>前回の作業があります</h1>
          <p>この端末に保存されたスタンプ作成データが見つかりました。</p>
          <div className="restore-actions">
            <button type="button" className="btn btn-primary btn-large" onClick={continueRestore}>
              続きから
            </button>
            <button type="button" className="btn btn-large" onClick={() => void startFresh()}>
              新しく作る
            </button>
          </div>
          <p>
            <Link to="/line/stamp">使い方ガイドへ戻る</Link>
          </p>
        </section>
      </main>
    )
  }

  return (
    <main className="page maker-page">
      <header className="site-header">
        <nav className="breadcrumb" aria-label="パンくず">
          <Link to="/">ツール一覧</Link>
          <span aria-hidden="true">/</span>
          <Link to="/line">LINE</Link>
          <span aria-hidden="true">/</span>
          <Link to="/line/stamp">スタンプメーカー</Link>
        </nav>
        <h1>LINEスタンプ画像メーカー</h1>
        <p className="lede">画像を選んで、LINE用ZIPをかんたん作成。</p>
        <p className="privacy-badge" role="note">
          画像はこの端末内だけで処理されます
        </p>
        <p className="save-status" role="status">
          {saveStatus === 'saving' && '保存中…'}
          {saveStatus === 'saved' && 'この端末に保存済み'}
          {saveStatus === 'error' && (saveError || '保存に失敗しました')}
          {saveStatus === 'idle' && '自動保存されます'}
        </p>
      </header>

      <section className="panel">
        <div className="panel-head">
          <h2>画像追加</h2>
          <p>複数選択できます。あとから追加も可能です。</p>
        </div>
        <ImagePicker onFiles={(files) => void addFiles(files)} />
        {actionError && (
          <p className="notice notice-error" role="alert">
            {actionError}
            <button type="button" className="btn btn-small" onClick={() => setActionError(null)}>
              閉じる
            </button>
          </p>
        )}
      </section>

      <section className="panel count-panel">
        <div className={`count-display ${countStatus.ok ? 'is-ok' : 'is-ng'}`}>
          <strong>{countStatus.title}</strong>
          <span>{countStatus.message}</span>
        </div>
        <div className="bg-switch" role="group" aria-label="一覧のプレビュー背景">
          {PREVIEW_BACKGROUND_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={project.previewBackground === opt.value ? 'is-active' : ''}
              onClick={() => setPreviewBackground(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>スタンプ一覧</h2>
          <p>編集・差し替え・削除・並べ替えができます</p>
        </div>
        <StampList
          stamps={project.stamps}
          previewBackground={project.previewBackground}
          onEdit={setEditingId}
          onReplace={(id, file) => void replaceStamp(id, file)}
          onDelete={removeStamp}
          onReorder={reorderStamps}
        />
      </section>

      <SpecialImageSection
        kind="main"
        special={project.main}
        stamps={project.stamps}
        previewBackground={project.previewBackground}
        onPreviewBackgroundChange={setPreviewBackground}
        onSelectStamp={selectMainFromStamp}
        onUpload={(file) => void uploadMain(file)}
        onTransformComplete={updateMainTransform}
      />

      <SpecialImageSection
        kind="tab"
        special={project.tab}
        stamps={project.stamps}
        previewBackground={project.previewBackground}
        onPreviewBackgroundChange={setPreviewBackground}
        onSelectStamp={selectTabFromStamp}
        onUpload={(file) => void uploadTab(file)}
        onTransformComplete={updateTabTransform}
      />

      <ValidationPanel project={project} />
      <ZipExport project={project} onZipNameChange={setZipName} />

      {undo && (
        <div className="undo-toast" role="status">
          <span>画像を削除しました</span>
          <button type="button" className="btn btn-small" onClick={undoRemove}>
            元に戻す
          </button>
        </div>
      )}

      {editingStamp && (
        <TransformEditor
          title={`${String(project.stamps.findIndex((s) => s.id === editingStamp.id) + 1).padStart(2, '0')}番を編集`}
          imageUrl={editingStamp.workingUrl}
          imageWidth={editingStamp.width}
          imageHeight={editingStamp.height}
          canvasWidth={spec.canvasSize.width}
          canvasHeight={spec.canvasSize.height}
          safeMargin={spec.marginRule.recommendedSafeMarginPx}
          initialTransform={editingStamp.transform}
          previewBackground={project.previewBackground}
          onPreviewBackgroundChange={setPreviewBackground}
          hasTransparency={editingStamp.hasTransparency}
          onCancel={() => setEditingId(null)}
          onComplete={(transform) => {
            updateStampTransform(editingStamp.id, transform)
            setEditingId(null)
          }}
        />
      )}
    </main>
  )
}
