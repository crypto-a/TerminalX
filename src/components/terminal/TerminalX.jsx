// src/components/terminal/TerminalX.jsx
import React, { useState, useEffect, useRef } from "react";
import "./TerminalX.css";
import CommandBlock from "./commandblock/CommandBlock.jsx";
import { invoke } from "@tauri-apps/api/core";

const TerminalX = ({ sessionId, tabName, type }) => {
    // Each element in `commands` will have a `prompt` (our "path>"), `command`, and `output`
    const [commands, setCommands] = useState([
        { prompt: "", command: `Welcome to ${tabName}!`, output: "" },
    ]);
    const [input, setInput] = useState("");

    // Keep track of the current directory (truncated) for this terminal session.
    // Initially, we can fetch it, or just wait until first command to fill it.
    const [currentPath, setCurrentPath] = useState("");

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
                // Invoke the Rust command
                const rawResponse = await invoke("run_local_command", { command: input });
                // `rawResponse` is actually a string that looks like '{"output":"...","cwd":"..."}'
                // We parse it:
                const result = JSON.parse(rawResponse);

                // The output from Rust
                const commandOutput = result.output;
                const newCwd = result.cwd;

                // Update the stored currentPath
                setCurrentPath(newCwd);

                // Build a new “command block” object
                const newCommand = {
                    prompt: newCwd ? `${newCwd}` : "", // show the truncated path
                    command: input,
                    output: commandOutput,
                };
                setCommands((prev) => [...prev, newCommand]);
            } catch (err) {
                console.error("Failed to run command:", err);
                const errorCommand = {
                    prompt: currentPath,
                    command: input,
                    output: `Error: ${err}`,
                };
                setCommands((prev) => [...prev, errorCommand]);
            }
        } else {
            // If type is "ssh" or something else
            const newCommand = {
                prompt: currentPath,
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
                        // We’ll display something like "[somepath] > user input"
                        command={`${cmd.prompt ? "[" + cmd.prompt + "] " : ""}${cmd.command}`}
                        output={cmd.output}
                        onCopy={() => handleCopy(cmd.command, cmd.output)}
                        onPin={handlePin}
                    />
                ))}
            </div>
            <form onSubmit={handleCommandSubmit} className="input-form">
                {/* Show the truncated path as part of the “prompt” or placeholder */}
                <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    placeholder={currentPath ? `[${currentPath}] $ ` : "Enter command..."}
                    className="input"
                />
            </form>
        </div>
    );
};

export default TerminalX;
