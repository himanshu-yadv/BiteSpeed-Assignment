import { create } from 'zustand'
import { addEdge as addReactFlowEdge, applyEdgeChanges, applyNodeChanges } from 'reactflow'
import type { Edge, EdgeChange, Node, NodeChange } from 'reactflow'

export type TextMessageNodeData = {
  content: string
}

type FlowStore = {
  nodes: Node<TextMessageNodeData>[]
  edges: Edge[]
  selectedNodeId: string | null
  setSelectedNodeId: (nodeId: string | null) => void
  addNode: (node: Node<TextMessageNodeData>) => void
  updateNodeData: (nodeId: string, data: Partial<TextMessageNodeData>) => void
  setNodes: (nodes: Node<TextMessageNodeData>[]) => void
  setEdges: (edges: Edge[]) => void
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  addEdge: (edge: Edge) => void
}

const initialNodes: Node<TextMessageNodeData>[] = [
  {
    id: 'node-1',
    type: 'textMessage',
    position: { x: 250, y: 80 },
    data: {
      content: 'Hello! How can I help you today?',
    },
  },
]

const initialEdges: Edge[] = []

export const useFlowStore = create<FlowStore>((set) => ({
  nodes: initialNodes,
  edges: initialEdges,
  selectedNodeId: null,
  setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),
  addNode: (node) =>
    set((state) => ({
      nodes: [...state.nodes, node],
      selectedNodeId: node.id,
    })),
  updateNodeData: (nodeId, data) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node,
      ),
    })),
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  onNodesChange: (changes) =>
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    })),
  onEdgesChange: (changes) =>
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    })),
  addEdge: (edge) =>
    set((state) => ({
      edges: addReactFlowEdge(edge, state.edges),
    })),
}))

