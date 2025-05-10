import { useEffect, useState } from "react";
import style from "../styles/BoxTextAI.module.css";
import { ImArrowUp2 } from "react-icons/im";

export const BoxTextAI = ({ handleSend, isLoadingAnswer }) => {
  // Para enviar un mensaje: 
  // 1. Primero preguntar si isLoadingAnswer es false
  // 2. preguntar si el input NO esta vacio
  // 3. enviar

  const [inputValue, setInputValue] = useState("");

  const handleChangeInput = ({ target }) => {
    setInputValue(target.value);
  };

  const sendMessage = (event) => {
    event.preventDefault();
    const trimmed = inputValue.trim(); // eliminando espacios en blanco por ambos lados
    if (!trimmed || isLoadingAnswer) return; // no envía si está vacío
    handleSend(trimmed);
    setInputValue("");
  };

  return (
    <form className={style.inputContainer}>
      <div className={style.inputBox}>
        <textarea
          className={style.inputMessage}
          placeholder="Escribe tu pregunta..."
          value={inputValue}
          onChange={handleChangeInput}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault(); // evita el salto de línea
              sendMessage(e);     // ejecuta el envío
            }
          }}
        ></textarea>
        <button className={style.sendButton} onClick={sendMessage} disabled={!inputValue.trim()}>
          <ImArrowUp2 />
        </button>
      </div>
    </form>
  );
};
