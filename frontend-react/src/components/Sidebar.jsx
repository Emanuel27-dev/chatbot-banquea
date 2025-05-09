import { useEffect, useState } from "react";
import style from "../styles/Sidebar.module.css";
import { AiOutlineDoubleLeft } from "react-icons/ai";

export const Sidebar = () => {
  const [titles, setTitles] = useState([]);
  const [loaderTitles, setLoaderTitles] = useState(true);

  const getTitles = async () => {
    // http://127.0.0.1:5000/titulos/serums
    const response = await fetch("http://127.0.0.1:5000/titulos/serums");
    const { titulos } = await response.json();
    setTitles([...titulos]);
    setLoaderTitles(false);
  };

  useEffect(() => {
    getTitles(); // llenando el arreglo con los titulos
  }, []);

  return (
    <section className={style.sidebar}>
      <header className={style.headerSidebar}>
        <div className={style.iconContainer}>
          <AiOutlineDoubleLeft />
        </div>
      </header>

      <article className={style.article}>
        <div className={style.container}>
          <header className={style.header}>
            <h1 className={style.headerTitle}>DOCUMENTOS</h1>
          </header>

          <div className={style.containerTitles}>
            {loaderTitles ? (
              <div className="loaderTitles"></div>
            ) : (
              titles.map(({ nombre, link, index }) => (
                <a href={link} target="_blank" className={style.title}>
                  {nombre}
                </a>
              ))
            )}
          </div>
        </div>
      </article>
    </section>
  );
};
