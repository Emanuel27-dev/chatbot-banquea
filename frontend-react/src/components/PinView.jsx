import { useState } from "react";
import style from "../styles/PinView.module.css";
import { GiPadlock } from "react-icons/gi";
import { useNavigate } from "react-router";

export const PinView = () => {
  const [inputValue, setInputValue] = useState("");
  const [isCorrect, setIsCorrect] = useState(true);
  const navigate = useNavigate();

  const handleInputValue = ({ target }) => {
    setInputValue(target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (inputValue === "12345") {
      navigate("/chat");
    } else {
      setIsCorrect(false);
    }
  };

  return (
    <form 
        className={style.section}
        onSubmit={handleSubmit}    
    >
      <div className={style.container}>
        <figure className={style.containerIcon}>
          <GiPadlock />
        </figure>
        <div className={style.containerInput}>
          <input
            type="password"
            className={style.input}
            value={inputValue}
            onChange={handleInputValue}
          />
        </div>
        {/* <div className={style.text}>Ingresar PIN</div> */}
        {isCorrect ? (
          <div className={style.text}>Ingresar PIN</div>
        ) : (
          <div className={`${style.text} ${style.textIcorrect}`}>
            Ingresó el PIN incorrecto
          </div>
        )}
        <button className={style.button}>Ingresar</button>
      </div>
    </form>
  );
};
