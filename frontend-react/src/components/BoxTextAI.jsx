import { useEffect, useState } from "react";
import style from "../styles/BoxTextAI.module.css";
import { ImArrowUp2 } from "react-icons/im";

export const BoxTextAI = ({ handleSend }) => {
  const [inputValue, setInputValue] = useState("");

  const handleChangeInput = ({ target }) => {
    setInputValue(target.value);
  };

  const sendMessage = (event) => {
    event.preventDefault();
    handleSend(inputValue);
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
        ></textarea>
        <button className={style.sendButton} onClick={sendMessage}>
          <ImArrowUp2 />
        </button>
      </div>
    </form>
  );
};
