import { useCallback, useMemo, useRef } from 'react'
import type { DragEvent } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  SelectionMode,
} from 'reactflow'
import type { Connection, OnSelectionChangeParams, ReactFlowInstance, Edge } from 'reactflow'
import { Toaster, toast } from 'react-hot-toast'
import 'reactflow/dist/style.css'
import { ReactFlowProvider } from 'reactflow'
import TextMessageNode from './nodes/TextMessageNode'
import { useFlowStore } from './store/flowStore'

type AvailableNodeType = {
  type: 'textMessage'
  title: string
  description: string
}

const availableNodeTypes: AvailableNodeType[] = [
  {
    type: 'textMessage',
    title: 'Text Message',
    description: 'Send a chatbot reply message',
  },
]

const nodeTypes = {
  textMessage: TextMessageNode,
}

const FlowBuilder = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null)

  const nodes = useFlowStore((state) => state.nodes)
  const edges = useFlowStore((state) => state.edges)
  const selectedNodeId = useFlowStore((state) => state.selectedNodeId)
  const setSelectedNodeId = useFlowStore((state) => state.setSelectedNodeId)
  const addNode = useFlowStore((state) => state.addNode)
  const updateNodeData = useFlowStore((state) => state.updateNodeData)
  const onNodesChange = useFlowStore((state) => state.onNodesChange)
  const onEdgesChange = useFlowStore((state) => state.onEdgesChange)
  const addEdge = useFlowStore((state) => state.addEdge)

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  )

  const canConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source) {
        return false
      }

      const hasExistingEdge = edges.some(
        (edge) =>
          edge.source === connection.source &&
          (!connection.sourceHandle || edge.sourceHandle === connection.sourceHandle),
      )

      if (hasExistingEdge) {
        return false
      }

      if (connection.source === connection.target) {
        return false
      }

      return true
    },
    [edges],
  )

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!canConnect(connection)) {
        toast.error('Each message can branch to only one next step.')
        return
      }

      if (!connection.source || !connection.target) {
        return
      }

      const id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `edge-${Date.now()}`

      const newEdge: Edge = {
        id,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle ?? undefined,
        targetHandle: connection.targetHandle ?? undefined,
        type: 'smoothstep',
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        style: { stroke: '#6366f1', strokeWidth: 2 },
      }

      addEdge(newEdge)
    },
    [addEdge, canConnect],
  )

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()

      const type = event.dataTransfer.getData('application/reactflow') as
        | AvailableNodeType['type']
        | ''

      if (!type || !reactFlowWrapper.current || !reactFlowInstance.current) {
        return
      }

      const bounds = reactFlowWrapper.current.getBoundingClientRect()
      const position = reactFlowInstance.current.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      })

      const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `node-${Date.now()}`

      addNode({
        id,
        type,
        position,
        data: {
          content: 'New chatbot message',
        },
      })
    },
    [addNode],
  )

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const handleSelectionChange = useCallback(
    (selection: OnSelectionChangeParams) => {
      const firstSelected = selection.nodes?.[0]?.id ?? null
      setSelectedNodeId(firstSelected ?? null)
    },
    [setSelectedNodeId],
  )

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null)
  }, [setSelectedNodeId])

  const handleSave = useCallback(() => {
    if (!nodes.length) {
      toast.error('Add at least one node before saving.')
      return
    }

    const nodesWithoutIncomingEdge = nodes.filter(
      (node) => !edges.some((edge) => edge.target === node.id),
    )

    if (nodesWithoutIncomingEdge.length > 1) {
      toast.error('Only one starting node is allowed. Connect your flow before saving.')
      return
    }

    const nodesWithoutMessage = nodes.filter(
      (node) => !node.data.content || !node.data.content.trim(),
    )
    if (nodesWithoutMessage.length > 0) {
      toast.error('Every node needs message content before saving.')
      return
    }

    toast.success('Flow saved successfully!')
    // Here you could persist to an API or storage. For now we log to the console.
    console.log(
      'Saved flow:',
      JSON.stringify(
        {
          nodes,
          edges,
        },
        null,
        2,
      ),
    )
  }, [edges, nodes])

  return (
    <div className="flex h-screen w-full flex-col bg-slate-100">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">BiteSpeed Chatbot Flow Builder</h1>
          <p className="text-sm text-slate-500">
            Drag nodes onto the canvas and connect them to design your chatbot journey.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
        >
          Save Flow
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside className="w-full border-b border-slate-200 bg-white md:h-full md:max-w-xs md:border-b-0 md:border-r">
          {selectedNode ? (
            <NodePropertiesPanel
              content={selectedNode.data.content}
              onChange={(value) => updateNodeData(selectedNode.id, { content: value })}
              onClose={() => setSelectedNodeId(null)}
            />
          ) : (
            <NodesPanel />
          )}
        </aside>

        <main className="flex-1 min-h-[320px]">
          <div
            ref={reactFlowWrapper}
            className="h-full w-full"
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={handleConnect}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onSelectionChange={handleSelectionChange}
              onPaneClick={handlePaneClick}
              selectionMode={SelectionMode.Partial}
              fitView
              proOptions={{ hideAttribution: true }}
              isValidConnection={canConnect}
              defaultEdgeOptions={{ animated: false }}
              onInit={(instance) => {
                reactFlowInstance.current = instance
              }}
              className="bg-slate-50"
            >
              <Background gap={24} color="#d4d4d8" />
              <MiniMap zoomable pannable className="!bg-white" maskColor="#eef2ff" />
              <Controls className="bg-white shadow-sm" />
            </ReactFlow>
          </div>
        </main>
      </div>
    </div>
  )
}

const NodesPanel = () => {
  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Nodes Library
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Drag a node onto the canvas to add it to your flow.
        </p>
      </div>
      <div className="space-y-3">
        {availableNodeTypes.map((node) => (
          <NodeTypeCard key={node.type} node={node} />
        ))}
      </div>
    </div>
  )
}

type NodeTypeCardProps = {
  node: AvailableNodeType
}

const NodeTypeCard = ({ node }: NodeTypeCardProps) => {
  const handleDragStart = useCallback(
    (event: DragEvent<HTMLDivElement>, nodeType: AvailableNodeType['type']) => {
      event.dataTransfer.setData('application/reactflow', nodeType)
      event.dataTransfer.effectAllowed = 'move'
    },
    [],
  )

  return (
    <div
      draggable
      onDragStart={(event) => handleDragStart(event, node.type)}
      className="cursor-grab rounded-lg border border-dashed border-slate-300 bg-white p-4 shadow-sm transition hover:border-indigo-400 hover:shadow-md active:cursor-grabbing"
    >
      <div className="text-sm font-semibold text-slate-800">{node.title}</div>
      <p className="mt-1 text-sm text-slate-500">{node.description}</p>
    </div>
  )
}

type NodePropertiesPanelProps = {
  content: string
  onChange: (value: string) => void
  onClose: () => void
}

const NodePropertiesPanel = ({ content, onChange, onClose }: NodePropertiesPanelProps) => {
  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Node Properties
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Configure the selected node’s message content.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700"
        >
          Close
        </button>
      </div>

      <label className="flex flex-1 flex-col text-sm text-slate-600">
        Message Text
        <textarea
          value={content}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Type the chatbot response..."
          className="mt-2 h-40 w-full resize-none rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200"
        />
      </label>
      <p className="text-xs text-slate-400">
        Tip: Use short sentences to keep your chatbot responses concise and helpful.
      </p>
    </div>
  )
}

export default function App() {
  return (
    <>
      <ReactFlowProvider>
        <FlowBuilder />
      </ReactFlowProvider>
      <Toaster position="bottom-right" />
    </>
  )
}

