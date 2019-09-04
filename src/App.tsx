import React from "react";
//const { dialog } = require("electron");

const App: React.FC = () => {
    return (
        <div className="App">
            <header className="App-header">
                <p>
                    Edit <code>src/App.tsx</code> and save to 1reload.
                </p>
                <a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
                    Learn React
                </a>
                <button
                    onClick={() => {
                      //  dialog.showOpenDialog({ properties: ["openFile", "openDirectory", "multiSelections"] });
                    }}
                >
                    alert
                </button>
                <button
                    onClick={() => {
                        let notif = new Notification("lalala");
                    }}
                >
                    notif
                </button>
            </header>
        </div>
    );
};

export default App;
