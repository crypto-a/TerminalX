import React from "react";
import "./TabBar.css";
import { FaTerminal, FaTimes } from "react-icons/fa";

const TabBar = ({ terminals, activeTerminalId, onCloseTab, onSetActiveTab }) => {
    return (
        <div className="tab-bar">
            {terminals.map((tab) => (
                <div
                    key={tab.id}
                    className={`tab ${activeTerminalId === tab.id ? "active" : ""}`}
                >
                    <FaTerminal className="tab-icon" />
                    <span
                        className="tab-name"
                        onClick={() => onSetActiveTab(tab.id)}
                    >
            {tab.name}
          </span>

                    <FaTimes
                        className="close-icon"
                        onClick={() => onCloseTab(tab.id)}
                    />
                </div>
            ))}
        </div>
    );
};

export default TabBar;
