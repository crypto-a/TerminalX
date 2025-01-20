import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import Sidebar from "./components/sidebar/Sidebar.jsx";
import TabBar from "./components/tabbar/TabBar.jsx";
// import TerminalX from "./components/terminal/TerminalX.jsx";

// If using JavaScript
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';



import TerminalX from "./components/terminal/TerminalX.jsx";

function App() {
    const [greetMsg, setGreetMsg] = useState("");
    const [name, setName] = useState("");

    // Keep track of all terminals (tab sessions)
    const [terminals, setTerminals] = useState([
        { id: 1, name: "Terminal 1", type: "local" },
        // { id: 2, name: "Terminal 2", type: "local" },
        // { id: 3, name: "Terminal 3", type: "local" },
    ]);
    // Which terminal tab is currently active
    const [activeTerminalId, setActiveTerminalId] = useState(1);


    /**
     * Handler for creating a new terminal. Called from the Sidebar's + icon.
     */
    const handleAddTerminal = () => {
        const name = prompt("Enter a name for the new terminal:");
        if (!name) return;

        // In the future, ask if this is an SSH or local terminal:
        const terminalType = prompt("Enter type: 'local' or 'ssh' (default is local)", "local");

        // Generate a unique ID (could use UUID or any unique mechanism)
        const newId = Date.now();

        setTerminals([...terminals, { id: newId, name, type: terminalType }]);
        setActiveTerminalId(newId); // Make the newly added tab active
    };

    /**
     * Handler for closing a terminal tab.
     */
    const handleCloseTab = (id) => {
        setTerminals(terminals.filter((t) => t.id !== id));
        // If the closed terminal was active, switch to the first in the list (if any left)
        if (activeTerminalId === id && terminals.length > 1) {
            setActiveTerminalId(terminals[0].id);
        }
    };

    async function greet() {
        setGreetMsg(await invoke("greet", { name }));
    }

    return (
        <main className="app">
            {/* Our Sidebar with an "Add Terminal" button */}
            <Sidebar onAddTerminal={handleAddTerminal} />
            <div className="main">
                {/* The TabBar at the top that shows all terminals */}
                <TabBar
                    terminals={terminals}
                    activeTerminalId={activeTerminalId}
                    onCloseTab={handleCloseTab}
                    onSetActiveTab={setActiveTerminalId}
                />

                {/* Render the currently active TerminalX */}
                {terminals.map((term) => {
                    if (term.id === activeTerminalId) {
                        return (
                            <TerminalX
                                key={term.id}
                                sessionId={term.id}
                                tabName={term.name}
                                type={term.type}
                            />
                        );
                    }
                    return null;
                })}
            </div>
        </main>
    );
}

export default App;

