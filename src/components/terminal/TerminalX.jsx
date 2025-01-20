// src/components/terminal/TerminalX.jsx
import React, { useState, useEffect, useRef } from "react";
import "./TerminalX.css";
import CommandBlock from "./commandblock/CommandBlock.jsx";
import { invoke } from "@tauri-apps/api/core";

const TerminalX = ({ sessionId, tabName, type }) => {
    const [commands, setCommands] = useState([
        { command: `Welcome to ${tabName}!`, output: "" },
    ]);
    const [input, setInput] = useState("");

    // Create a ref for the output container
    const outputRef = useRef(null);

    useEffect(() => {
        // Scroll to the bottom whenever commands change
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [commands]);

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const handleCommandSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        if (type === "local") {
            try {
                const output = await invoke("run_local_command", { command: input });
                const newCommand = { command: input, output: output };
                setCommands((prev) => [...prev, newCommand]);
            } catch (err) {
                console.error("Failed to run command:", err);
                const errorCommand = { command: input, output: `Error: ${err}` };
                setCommands((prev) => [...prev, errorCommand]);
            }
        } else {
            const newCommand = {
                command: input,
                output: "SSH mode not yet implemented.",
            };
            setCommands((prev) => [...prev, newCommand]);
        }

        setInput(""); // Clear the input field
    };

    const handleCopy = (cmd, out) => {
        navigator.clipboard.writeText(`${cmd}\n${out}`);
        alert("Command and output copied!");
    };

    const handlePin = () => {
        alert("Pinned the command!");
    };

    return (
        <div className="terminal-x">
            <div className="output" ref={outputRef}>
                {commands.map((cmd, index) => (
                    <CommandBlock
                        key={index}
                        command={cmd.command}
                        output={cmd.output}
                        onCopy={() => handleCopy(cmd.command, cmd.output)}
                        onPin={handlePin}
                    />
                ))}
            </div>
            <form onSubmit={handleCommandSubmit} className="input-form">
                <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Enter command..."
                    className="input"
                />
            </form>
        </div>
    );
};

export default TerminalX;
