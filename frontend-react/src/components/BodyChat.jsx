import { BoxTextAI } from "./BoxTextAI";
import style from "../styles/BodyChat.module.css";
import { useEffect, useRef, useState } from "react";
import { Loader } from "./Loader";
import logo from "../assets/banqueaIcon.png";

import { ImBook } from "react-icons/im";
import {
  AiFillLike,
  AiOutlineLike,
  AiFillDislike,
  AiOutlineDislike,
} from "react-icons/ai";
import { AiOutlineDoubleRight,AiOutlineDoubleLeft,AiOutlineMenu } from "react-icons/ai";
import { Sidebar } from "./Sidebar";

export const BodyChat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const bottomRef = useRef(null);

  // Scroll automático al final cuando cambian los mensajes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // funcion para administrar los mensajes de usuario y bot
  const handleSend = async (inputValue) => {
    const newUserMessage = { sender: "user", text: inputValue };
    // Mostrando el mensaje del usuario
    setMessages((prev) => [...prev, newUserMessage]);

    // Mostrar el loader
    setLoading(true);

    // Llamando a la API http://192.168.18.8:5000
    const response = await fetch("https://1mf6c2b1-5000.brs.devtunnels.ms/chat/serums", {
      method: "POST",
      headers: {
        "Content-Type": `application/json`,
      },
      body: JSON.stringify({ question: inputValue }),
    });

    const { respuesta } = await response.json();

    // agregar la respuesta del bot al arreglo messages
    const newBotMessage = { sender: "bot", text: respuesta };
    setMessages((prev) => [...prev, newBotMessage]);
    // console.log(messages);
    setLoading(false);
  };

  const handleSidebar = () => {
    setIsHidden(!isHidden);
  }


  return (
    <main className={style.main}>
      <Sidebar isHidden={isHidden}/>

      <div className={style.sidechat}>
        {/* Componente para header de chat */}
        <header className={style.headerChat}>
          <div className={style.iconContainer} onClick={handleSidebar}>
            <AiOutlineMenu />
          </div>
          <figure className={style.logoContainer}>
            <img src={logo} alt="logoBanquea" className={style.logoBanquea} />
          </figure>
        </header>

        <div className={style.chatContainer}>
          {/* <div className={style.contMessageWelcome}>
            <h1 className={style.messageWelcome}>Bienvenido al chat serums</h1>
          </div> */}
          <div className={style.chatMessagesContainer}>
            <div className={style.chatMessages}>
              {messages.map(({ sender, text }, index) =>
                sender === "user" ? (
                  <div
                    key={index}
                    className={`${style.messageRow} ${style.user}`}
                  >
                    <div className={`${style.message} ${style.user}`}>
                      {text}
                    </div>
                  </div>
                ) : (
                  <div className={style.messageRow} key={index}>
                    <div className={style.avatar}>
                      <ImBook />
                    </div>
                    <div className={`${style.message} ${style.bot}`}>
                      <p>{text}</p>
                      {/* ICONOS LIKE, DISLIKE */}
                      <div className={style.icons}>
                        <div>
                          <AiOutlineLike />
                        </div>
                        <div>
                          <AiOutlineDislike />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
              {loading && <Loader />}
              <div ref={bottomRef} />
            </div>
          </div>
          <BoxTextAI handleSend={handleSend} isLoadingAnswer={loading} />
        </div>
      </div>
    </main>
  );
};
