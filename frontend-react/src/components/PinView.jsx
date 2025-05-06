import { useState } from "react";
import style from "../styles/PinView.module.css";
import { GiPadlock } from "react-icons/gi";

export const PinView = () => {

  const [inputValue, setInputValue] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);

  const handleInputValue = ({ target }) => {
    setInputValue(target.value);
  };

  const handleButton = () => {
    if (inputValue === '12345') {
        console.log('PIN CORRECTO')
        setIsCorrect(true);
    }
    else {
        setIsCorrect(false);
        console.log('PIN INCORRECTO')
    }
  }


  return (
    <section className={style.section}>
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
        { (isCorrect) ? (<div className={style.text}>Ingresó el PIN correcto</div>) : (<div className={`${style.text} ${style.textIcorrect}`}>Ingresó el pin incorrecto</div>)}
        <button 
            className={style.button}
            onClick={handleButton}   
        >Ingresar</button>
      </div>
    </section>
  );
};
