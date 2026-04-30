import { useState, useEffect } from "react";
import "./App.css";

export default function App() {
  const now = () => new Date().toISOString();

  const [display, setDisplay] = useState("");
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [rate, setRate] = useState(() => {
    return Number(localStorage.getItem("rate")) || 520;
  });

  const [iva] = useState(13);
  const [showHistory, setShowHistory] = useState(false);

  // ======================
  // GUARDADO AUTOMÁTICO
  // ======================
  useEffect(() => {
    localStorage.setItem("history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem("rate", rate);
  }, [rate]);

  // ======================
  // TECLADO
  // ======================
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= "0" && e.key <= "9") add(e.key);
      else if (e.key === "+") add("+");
      else if (e.key === "-") add("-");
      else if (e.key === "*") add("×");
      else if (e.key === "/") { e.preventDefault(); add("÷"); }
      else if (e.key === ".") add(".");
      else if (e.key === "Enter" || e.key === "=") calculate();
      else if (e.key === "Backspace") setDisplay((prev) => prev.slice(0, -1));
      else if (e.key === "Escape") clear();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [display]);

  // ======================
  // CALCULADORA
  // ======================
  const add = (value) => setDisplay((prev) => prev + value);
  const clear = () => setDisplay("");

  const calculate = () => {
    try {
      const result = eval(display.replace(/÷/g, "/").replace(/×/g, "*"));
      setHistory((prev) => [
        ...prev,
        { texto: `${display} = ${result}`, fecha: now() }
      ]);
      setDisplay(String(result));
    } catch {
      setDisplay("Error");
    }
  };

  const percentage = () => {
    setDisplay((prev) => String(Number(prev) / 100));
  };

  const applyIVA = () => {
    const value = Number(display);
    const result = value + (value * iva) / 100;
    setHistory((prev) => [
      ...prev,
      { texto: `${value} + IVA(${iva}%) = ${result}`, fecha: now() }
    ]);
    setDisplay(String(result));
  };

  const usdToCrc = () => {
    const result = Number(display) * rate;
    setHistory((prev) => [
      ...prev,
      { texto: `$${display} → ₡${result}`, fecha: now() }
    ]);
    setDisplay(String(result));
  };

  const crcToUsd = () => {
    const result = Number(display) / rate;
    setHistory((prev) => [
      ...prev,
      { texto: `₡${display} → $${result.toFixed(2)}`, fecha: now() }
    ]);
    setDisplay(String(result.toFixed(2)));
  };

  // ======================
  // HISTORIAL
  // ======================
  const exportHistory = () => {
    if (!history.length) return;

    const data = {
      exportadoEn: now(),
      total: history.length,
      historial: history
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json"
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "historial-calculadora.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearHistory = () => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas borrar el historial? Esta acción no se puede deshacer.");
    if (!confirmDelete) return;
    setHistory([]);
    localStorage.removeItem("history");
  };

  return (
    <div className="app">

      {/* CALCULADORA */}
      <div className="calculator">

        <div className="screen">
          {display || "0"}
        </div>

        <div className="buttons">
          <button onClick={() => add("7")}>7</button>
          <button onClick={() => add("8")}>8</button>
          <button onClick={() => add("9")}>9</button>
          <button onClick={() => add("÷")}>÷</button>

          <button onClick={() => add("4")}>4</button>
          <button onClick={() => add("5")}>5</button>
          <button onClick={() => add("6")}>6</button>
          <button onClick={() => add("×")}>×</button>

          <button onClick={() => add("1")}>1</button>
          <button onClick={() => add("2")}>2</button>
          <button onClick={() => add("3")}>3</button>
          <button onClick={() => add("-")}>-</button>

          <button onClick={() => add("0")}>0</button>
          <button onClick={() => add(".")}>.</button>
          <button onClick={calculate}>=</button>
          <button onClick={() => add("+")}>+</button>

          <button onClick={clear}>C</button>
        </div>

        <div className="extras">
          <button onClick={percentage}>%</button>
          <button onClick={applyIVA}>IVA</button>
          <button onClick={usdToCrc}>USD → CRC</button>
          <button onClick={crcToUsd}>CRC → USD</button>
          <button onClick={exportHistory}> Exportar</button>
          <button onClick={clearHistory}> Borrar</button>
        </div>

        <div className="config">
          <h3> Tipo de cambio</h3>
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
          />
          <p>1 USD = ₡{rate}</p>
        </div>

      </div>

      {/* BOTÓN FLOTANTE - FUERA DE LA CALCULADORA */}
      <button
        className="history-fab"
        onClick={() => setShowHistory((p) => !p)}
      >
        Historial
      </button>

      {/* PANEL LATERAL - FUERA DE LA CALCULADORA */}
      {showHistory && (
        <div className="modal">
          <h3>Historial</h3>

          {history.length === 0 && <p>Sin registros</p>}

          {history.map((item, i) => (
            <p key={i}>
              {item.texto}
              <br />
              <small>{item.fecha}</small>
            </p>
          ))}

          <button onClick={() => setShowHistory(false)}>Cerrar</button>
        </div>
      )}

    </div>
  );
}