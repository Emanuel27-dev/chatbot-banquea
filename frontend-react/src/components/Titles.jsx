import { useEffect, useState } from "react";
import style from "../styles/Titles.module.css";

export const Titles = () => {
  const [titles, setTitles] = useState([]);

  const getTitles = async () => {
    const response = await fetch("http://127.0.0.1:5000/titulos/serums");
    const { titulos } = await response.json();
    setTitles([...titulos]);
  };

  useEffect(() => {
    getTitles(); // llenando el arreglo con los titulos
  }, []);

  return (
    <article className={style.article}>
      <header className={style.header}>
        <h1 className={style.headerTitle}>titulos</h1>
      </header>
      <div className={style.containerTitles}>
        {titles.map((title) => (
          <div className={style.title}>{title}</div>
        ))}
      </div>
    </article>
  );
};
