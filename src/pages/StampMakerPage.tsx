import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CopyPromptStep } from '../components/maker/CopyPromptStep'
import { ImagePicker } from '../components/maker/ImagePicker'
import { MakerStepNav } from '../components/maker/MakerStepNav'
import { MakerStepper } from '../components/maker/MakerStepper'
import { SpecialImageSection } from '../components/maker/SpecialImageSection'
import { StampList } from '../components/maker/StampList'
import { TransformEditor } from '../components/maker/TransformEditor'
import { ValidationPanel } from '../components/maker/ValidationPanel'
import { ZipExport } from '../components/maker/ZipExport'
import { BackgroundSwitch } from '../components/common/BackgroundSwitch'
import { MAKER_STEPS, type MakerStepId, stepIndex } from '../constants/makerSteps'
import { getStampSpec } from '../config/stampSpecs'
import { useStampProject } from '../hooks/useStampProject'
import { resolveSpecialSource } from '../lib/project/factory'
import { getCountStatus } from '../lib/validation/validate'

function clampStep(id: MakerStepId, maxReachable: MakerStepId): MakerStepId {
  return stepIndex(id) <= stepIndex(maxReachable) ? id : maxReachable
}

export function StampMakerPage() {
  const {
    project,
    ready,
    restoreAvailable,
    continueRestore,
    startFresh,
    actionError,
    setActionError,
    undo,
    undoRemove,
    addFiles,
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

  const [step, setStep] = useState<MakerStepId>('stamps')
  const [editingId, setEditingId] = useState<string | null>(null)
  const spec = getStampSpec()
  const countStatus = getCountStatus(project.stamps.length)
  const editingStamp = project.stamps.find((s) => s.id === editingId) ?? null

  const mainReady = Boolean(resolveSpecialSource(project.main, project.stamps))
  const tabReady = Boolean(resolveSpecialSource(project.tab, project.stamps))
  const coverReady = mainReady && tabReady

  const maxReachable: MakerStepId = useMemo(() => {
    if (!countStatus.ok) return 'stamps'
    if (!coverReady) return 'cover'
    // ZIP まで進めたら、説明文ステップも開ける（中身は今後追加）
    return 'copy'
  }, [countStatus.ok, coverReady])

  useEffect(() => {
    setStep((current) => clampStep(current, maxReachable))
  }, [maxReachable])

  const goTo = (id: MakerStepId) => {
    setStep(clampStep(id, maxReachable))
  }

  const goNext = () => {
    const i = stepIndex(step)
    const next = MAKER_STEPS[i + 1]
    if (next) goTo(next.id)
  }

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
            <Link to="/line">LINE関連ツールへ戻る</Link>
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
        </nav>
        <h1>LINEスタンプ画像メーカー</h1>
      </header>

      <MakerStepper current={step} maxReachable={maxReachable} onSelect={goTo} />

      {step === 'stamps' && (
        <>
          {project.stamps.length === 0 ? (
            <section className="panel">
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
          ) : (
            <section className="panel">
              <div className="panel-head">
                <div>
                  <h2>スタンプ一覧</h2>
                  <p className="panel-subhint">
                    タップで編集・ドラッグで順番を並べ替え
                  </p>
                </div>
                <BackgroundSwitch
                  value={project.previewBackground}
                  onChange={setPreviewBackground}
                  ariaLabel="一覧のプレビュー背景"
                />
              </div>
              {actionError && (
                <p className="notice notice-error" role="alert">
                  {actionError}
                  <button type="button" className="btn btn-small" onClick={() => setActionError(null)}>
                    閉じる
                  </button>
                </p>
              )}
              <StampList
                stamps={project.stamps}
                previewBackground={project.previewBackground}
                onEdit={setEditingId}
                onDelete={removeStamp}
                onReorder={reorderStamps}
                onAddFiles={(files) => void addFiles(files)}
              />
            </section>
          )}

          <MakerStepNav
            onNext={goNext}
            nextLabel="② メイン・タブ画像へ"
            nextDisabled={!countStatus.ok}
            stampCount={project.stamps.length}
            countMessage={
              project.stamps.length === 0
                ? undefined
                : countStatus.ok
                  ? '枚数がそろいました。次へ進めます'
                  : '8 / 16 / 24 / 32 / 40 枚にそろえてください'
            }
            nextHintTone={countStatus.ok ? 'ok' : 'warn'}
          />
        </>
      )}

      {step === 'cover' && (
        <>
          <section className="panel">
            <div className="panel-head">
              <div>
                <h2>メイン・タブ画像</h2>
                <p className="panel-subhint">
                  スタンプから選ぶか、画像をアップロードして調整します
                </p>
              </div>
              <BackgroundSwitch
                value={project.previewBackground}
                onChange={setPreviewBackground}
                ariaLabel="メイン・タブのプレビュー背景"
              />
            </div>

            <div className="cover-grid">
              <SpecialImageSection
                kind="main"
                special={project.main}
                stamps={project.stamps}
                previewBackground={project.previewBackground}
                onPreviewBackgroundChange={setPreviewBackground}
                onSelectStamp={selectMainFromStamp}
                onUpload={uploadMain}
                onTransformComplete={updateMainTransform}
              />

              <SpecialImageSection
                kind="tab"
                special={project.tab}
                stamps={project.stamps}
                previewBackground={project.previewBackground}
                onPreviewBackgroundChange={setPreviewBackground}
                onSelectStamp={selectTabFromStamp}
                onUpload={uploadTab}
                onTransformComplete={updateTabTransform}
              />
            </div>
          </section>

          <MakerStepNav
            onNext={goNext}
            nextLabel="ZIP作成へ"
            nextDisabled={!coverReady}
            nextHint={
              coverReady
                ? 'メイン画像とトークルームタブ画像の準備ができました'
                : 'メイン画像とトークルームタブ画像の両方を設定してください'
            }
            nextHintTone={coverReady ? 'ok' : 'warn'}
          />
        </>
      )}

      {step === 'zip' && (
        <>
          <section className="panel">
            <div className="panel-head">
              <h2>3. ZIP作成</h2>
              <p>内容を確認して、Creators Market 用のZIPを作成します</p>
            </div>
          </section>

          <ValidationPanel project={project} />
          <ZipExport project={project} onZipNameChange={setZipName} />

          <MakerStepNav
            onNext={goNext}
            nextLabel="タイトル・説明文へ"
            nextHint="ZIP作成のあと、タイトル・説明文用のサポート（準備中）へ進めます。"
          />
        </>
      )}

      {step === 'copy' && <CopyPromptStep />}

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
          onCancel={() => setEditingId(null)}
          onComplete={(transform) => {
            updateStampTransform(editingStamp.id, transform)
            setEditingId(null)
          }}
        />
      )}

      <p className="disclaimer">
        本ツールはLINEヤフー株式会社の公式サービスではありません。
      </p>
    </main>
  )
}
