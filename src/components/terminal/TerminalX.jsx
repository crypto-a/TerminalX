import React, { useState } from "react";
import "./TerminalX.css";
import CommandBlock from "./commandblock/CommandBlock.jsx";
import { invoke } from "@tauri-apps/api/core";

/**
 * A single terminal session component, which runs on either "local" or "ssh" (future).
 *
 * @param {object} props
 * @param {number} props.sessionId - Unique ID for the terminal session
 * @param {string} props.tabName - Display name of this terminal session
 * @param {string} props.type - "local" or "ssh" (currently ignoring SSH)
 */
const TerminalX = ({ sessionId, tabName, type }) => {
    // We maintain a list of commands+outputs for THIS particular terminal session
    const [commands, setCommands] = useState([
        { command: `Welcome to ${tabName}!`, output: "" },
    ]);
    const [input, setInput] = useState("");

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const handleCommandSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Right now, we only demonstrate "local" commands.
        // In a real SSH scenario, you'd call a different Tauri command or handle differently.
        if (type === "local") {
            try {
                // call the rust command named "run_local_command"
                const output = await invoke("run_local_command", { command: input });
                const newCommand = { command: input, output: output };
                setCommands((prev) => [...prev, newCommand]);
            } catch (err) {
                console.error("Failed to run command:", err);
                const errorCommand = { command: input, output: `Error: ${err}` };
                setCommands((prev) => [...prev, errorCommand]);
            }
        } else {
            // For "ssh" you'd do something else
            const newCommand = {
                command: input,
                output: "SSH mode not yet implemented.",
            };
            setCommands((prev) => [...prev, newCommand]);
        }

        setInput(""); // clear the input field
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
            <div className="output">
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
