import style from '../styles/Header.module.css';

export const Header = () => {
  return (
    <header className={style.header}>
      <figure className={style.content_logo}>
        <img className={style.logo} src="https://banquea.pe/image/carousel/banquea.png" alt="logo" />
      </figure>
    </header>
  );
};
