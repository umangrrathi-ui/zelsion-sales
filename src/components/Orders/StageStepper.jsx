import { STAGES, getStageIndex } from '../../lib/utils'

export default function StageStepper({ currentStage }) {
  const currentIdx = getStageIndex(currentStage)

  return (
    <div className="flex items-center justify-between px-4 py-3 overflow-x-auto gap-1">
      {STAGES.map((stage, i) => {
        const isCompleted = i < currentIdx
        const isCurrent = i === currentIdx
        return (
          <div key={stage.key} className="flex flex-col items-center gap-1 flex-shrink-0">
            <div
              className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                isCompleted ? 'bg-success border-success' :
                isCurrent ? 'bg-navy border-navy scale-125' :
                'bg-white border-gray-300'
              }`}
            />
            {isCurrent && <span className="text-[8px] text-navy font-bold whitespace-nowrap">{stage.label}</span>}
          </div>
        )
      })}
    </div>
  )
}
