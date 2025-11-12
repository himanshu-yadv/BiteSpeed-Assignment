import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import type { NodeProps } from 'reactflow'
import type { TextMessageNodeData } from '../store/flowStore'

const TextMessageNode = memo(({ data, selected }: NodeProps<TextMessageNodeData>) => {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow ${
        selected ? 'ring-2 ring-indigo-500' : 'hover:shadow-md'
      }`}
    >
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Text Message
      </div>
      <p className="text-sm text-slate-700">{data.content || 'Tap to edit message'}</p>

      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !bg-indigo-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !bg-indigo-500"
      />
    </div>
  )
})

TextMessageNode.displayName = 'TextMessageNode'

export default TextMessageNode

