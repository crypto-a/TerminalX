import React, { useState } from "react";
import { AiOutlineCopy, AiOutlineCheck, AiOutlinePushpin, AiFillPushpin } from "react-icons/ai";
import "./CommandBlock.css";

const CommandBlock = ({ command, output, onCopy, onPin }) => {
    const [copied, setCopied] = useState(false);
    const [pinned, setPinned] = useState(false);

    const handleCopy = () => {
        setCopied(true);
        if (onCopy) onCopy();
        setTimeout(() => setCopied(false), 3000); // Reset after 3 seconds
    };

    const handlePin = () => {
        setPinned(!pinned);
        if (onPin) onPin();
    };

    return (
        <div className={`command-block ${output.trim() === "" ? "compact" : ""}`}>
            <div className="command-line">
                <span className="command-text">{`> ${command}`}</span>
                {output.trim() !== "" && (
                    <div className="command-buttons">
                        <button onClick={handleCopy} className="command-button copy-button">
                            {copied ? <AiOutlineCheck size={18} /> : <AiOutlineCopy size={18} />}
                        </button>
                        <button onClick={handlePin} className="command-button pin-button">
                            {pinned ? <AiFillPushpin size={18} /> : <AiOutlinePushpin size={18} />}
                        </button>
                    </div>
                )}
            </div>
            {output.trim() !== "" && (
                <div className="output-text">
                    {output.split('\n').map((line, index) => (
                        <span key={index}>
                            {line}
                            <br />
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommandBlock;
