# BiteSpeed Chatbot Flow Builder

This project is the solution for the BiteSpeed Frontend Task: a visual, drag-and-drop flow builder for designing chatbot conversation paths. It allows users to create, connect, and configure message nodes, with built-in validation to ensure a proper conversation flow before saving.

## 🚀 Features

The application is built around the following core functionalities:

* **Text Message Node:** Supports adding individual message nodes, currently the only available node type, with an extensible architecture to add more types in the future.
* **Drag & Drop Interface:** Nodes can be easily added to the flow canvas by dragging them from the **Nodes Panel** on the left.
* **Contextual Properties Panel:** When a node is selected (by clicking it), the sidebar switches to the **Node Properties Panel**, allowing the user to edit the message content of the selected node.
* **Flow Connection Logic:**
    * A message node can only have **one outgoing edge** (one next step). The application validates this rule during connection and displays an error if a user attempts to add a second outgoing edge.
    * Multiple edges can target a single node.
* **Save Validation:** The "Save Flow" button performs crucial checks to ensure a valid flow before saving:
    1.  **Single Starting Node Check:** Ensures there is only one node without any incoming connections, preventing a flow from having multiple entry points.
    2.  **Empty Content Check:** Ensures all nodes have content defined.
* **User Feedback:** All validation results and actions are communicated using toast notifications (powered by `react-hot-toast`).

## 💻 Tech Stack

The project is built using the following modern web technologies:

* **Framework:** [React](https://react.dev/) (v19)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Flow Library:** [React Flow](https://reactflow.dev/) (v11)
* **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Build Tool:** [Vite](https://vitejs.dev/)

## 🛠️ Setup and Installation

Follow these steps to get the project running locally.

### Prerequisites

* Node.js (LTS recommended)
* npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Navigate into the project directory:
    ```bash
    cd <project-directory>
    ```
3.  Install the dependencies:
    ```bash
    npm install
    # or
    # yarn install
    ```

### Running the Application

Start the development server:

```bash
npm run dev
# or
# yarn dev
