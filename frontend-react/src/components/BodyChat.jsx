import { BoxTextAI } from "./BoxTextAI";
import style from "../styles/BodyChat.module.css";
import { useEffect, useRef, useState } from "react";
import { Loader } from "./Loader";
import logo from "../assets/banqueaIcon.png";

import { ImBook } from "react-icons/im";
import { AiOutlineMenu } from "react-icons/ai";
import { Sidebar } from "./Sidebar";
import { useMessages } from "../hooks/useMessages";
import {
  AiFillLike,
  AiOutlineLike,
  AiFillDislike,
  AiOutlineDislike,
} from "react-icons/ai";

export const BodyChat = () => {
  const { messages, loading, handleSend, handleLike } = useMessages(); // custom hook para traer los mensajes (user,bot) y estado de loading, tambien trae la funcion para manejar los likes
  const [isHidden, setIsHidden] = useState(true);
  const bottomRef = useRef(null);

  // Scroll automático al final cuando cambian los mensajes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSidebar = () => {
    setIsHidden(!isHidden);
  };

  return (
    <main className={style.main}>
      <Sidebar isHidden={isHidden} />

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
          <div className={style.chatMessagesContainer}>
            <div className={style.chatMessages}>
              {/* Si el arreglo esta vacio mostramos el mensaje de bienvenida, caso contrario se inicia la conversacion */}

              {messages.length === 0 ? (
                <div className={style.contMessageWelcome}>
                  <p className={style.messageWelcome}>
                    Bienvenido al chat de serums, ¿en qué te puedo ayudar?
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <>
                      <div className={`${style.messageRow} ${style.user}`}>
                        <div className={`${style.message} ${style.user}`}>
                          {message.pregunta}
                        </div>
                      </div>
                      {message.respuesta && (
                        <div className={style.messageRow}>
                          <div className={style.avatar}>
                            <ImBook />
                          </div>

                          <div className={`${style.message} ${style.bot}`}>
                            <p className={style.messageTextBot}>
                              {message.respuesta}
                            </p>
                            <div className={style.icons}>
                              <div
                                onClick={() => handleLike({ ...message }, true)}
                              >
                                {message.evaluacion !== null &&
                                message.evaluacion ? (
                                  <AiFillLike />
                                ) : (
                                  <AiOutlineLike />
                                )}
                              </div>
                              <div
                                onClick={() =>
                                  handleLike({ ...message }, false)
                                }
                              >
                                {message.evaluacion !== null &&
                                message.evaluacion === false ? (
                                  <AiFillDislike />
                                ) : (
                                  <AiOutlineDislike />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ))}
                  {loading && <Loader />}
                  <div ref={bottomRef} />
                </>
              )}
            </div>
          </div>
          <BoxTextAI handleSend={handleSend} isLoadingAnswer={loading} />
        </div>
      </div>
    </main>
  );
};
