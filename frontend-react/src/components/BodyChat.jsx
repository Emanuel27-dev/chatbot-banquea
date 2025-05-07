import { BoxTextAI } from "./BoxTextAI";
import style from "../styles/BodyChat.module.css";
import { useEffect, useRef, useState } from "react";
import { Loader } from "./Loader";

import { ImBook } from "react-icons/im";
import {
  AiFillLike,
  AiOutlineLike,
  AiFillDislike,
  AiOutlineDislike,
} from "react-icons/ai";

export const BodyChat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

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
    console.log(messages);
    setLoading(false);
  };

  return (
    <section className={style.container}>
      <div className={style.containerTwo}>
        <div className={style.messages}>
          {messages.map(({ sender, text }, index) =>
            sender === "user" ? (
              <div key={index} className={style.messageRowUser}>
                <div className={`${style.message} ${style.messageUser}`}>
                  {text}
                </div>
              </div>
            ) : (
              <div className={style.messageRowBot}>
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
          <div ref={bottomRef} /> {/* marcador invisible */}
        </div>

        <BoxTextAI handleSend={handleSend} />
      </div>
    </section>
  );
};
