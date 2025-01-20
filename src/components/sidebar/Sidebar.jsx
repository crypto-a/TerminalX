import "./Sidebar.css";
import { FaTerminal, FaPlus, FaCog } from "react-icons/fa";

function Sidebar({ onAddTerminal }) {
    return (
        <div className="sidebar">
            {/* Top Section */}
            <div className="sidebar-top">
                <div className="sidebar-icon">
                    <FaTerminal />
                </div>

                {/* + icon triggers onAddTerminal */}
                <div className="sidebar-icon" onClick={onAddTerminal}>
                    <FaPlus />
                </div>
            </div>

            {/* Bottom Section */}
            <div className="sidebar-bottom">
                <div className="sidebar-icon">
                    <FaCog />
                </div>
            </div>
        </div>
    );
}

export default Sidebar;
