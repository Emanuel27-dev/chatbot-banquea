import { useState } from "react";

export function useMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // funcion para administrar los mensajes de usuario y bot
  const handleSend = async (inputValue) => {
    const newMessage = {
      id: crypto.randomUUID(),
      especialidad: "serums",
      pregunta: inputValue,
      respuesta: null,
      evaluacion: null,
    };

    // mostramos la pregunta del usuario
    setMessages((prev) => [...prev, newMessage]);

    // mostrando loading
    setLoading(true);
    try {
      const response = await fetch(
        "https://1mf6c2b1-5000.brs.devtunnels.ms/chat/serums",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: inputValue }),
        }
      );

      const { respuesta } = await response.json();

      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === newMessage.id) {
            return { ...msg, respuesta };
          } else {
            return msg;
          }
        })
      );
    } catch (error) {
      console.error("❌ Error al obtener respuesta del bot", error);
    }

    setLoading(false);
  };

  const handleLike = async (message, confirmation) => {
    /***
     * 1. darle like
     * 2. Ejecutar handleLike
     * 3. Envio la peticion con el metodo POST, fetch()
     * 4. Si la respuesta esta ok, cambio el icono a fill, actualizando un estado??
     * 5. eliminar el otro icono
     *
     * Si es null se hace la peticion, si tiene true o false ejecutamos return
     *
     */
    if (message.evaluacion !== null) return; // si es true o false, No se realiza el POST
    // Si es evaluacion es null entonces se realiza el POST y ademas se actualiza el estado de message
    message = { ...message, evaluacion: confirmation };

    const response = await fetch(
      "https://1mf6c2b1-5000.brs.devtunnels.ms/feedback",
      {
        method: "POST",
        headers: {
          "Content-Type": `application/json`,
        },
        body: JSON.stringify({
          especialidad: message.especialidad,
          pregunta: message.pregunta,
          respuesta: message.respuesta,
          evaluacion: message.evaluacion,
        }),
      }
    );

    if (response.ok) {
      // Actualizamos la evaluacion en el objeto entre todo el arreglo messages
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === message.id) {
            return {
              ...msg,
              evaluacion: message.evaluacion,
            };
          } else {
            return { ...msg };
          }
        })
      );
    }
  };

  return {
    messages,
    setMessages,
    loading,
    setLoading,
    handleSend,
    handleLike,
  };
}
