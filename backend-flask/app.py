import os
import json
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQA, LLMChain
from langchain.schema import Document

# 📦 Cache en memoria
correccion_cache = {}
CACHE_FILE = "cache.json"
PALABRAS_SENSIBLES_FILE = "palabras_sensibles.txt"

# 📝 Configurar logging
logging.basicConfig(
    filename="app.log",
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    encoding="utf-8"
)

# 🛡️ Cargar palabras sensibles desde archivo externo
def cargar_palabras_sensibles():
    if not os.path.exists(PALABRAS_SENSIBLES_FILE):
        mensaje = "⚠️ Advertencia: No se encontró 'palabras_sensibles.txt'. No se aplicará el filtro de protección."
        print(mensaje)
        logging.warning(mensaje)
        return []

    with open(PALABRAS_SENSIBLES_FILE, "r", encoding="utf-8") as f:
        lineas = [line.strip().lower() for line in f.readlines() if line.strip()]

    if not lineas:
        mensaje = "⚠️ Advertencia: 'palabras_sensibles.txt' está vacío. El filtro de protección no detectará frases sensibles."
        print(mensaje)
        logging.warning(mensaje)
    else:
        logging.info(f"✅ Se cargaron {len(lineas)} palabras sensibles desde '{PALABRAS_SENSIBLES_FILE}'.")

    return lineas

PALABRAS_SENSIBLES = cargar_palabras_sensibles()

# 📦 Funciones de cache

def cargar_cache():
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def guardar_cache():
    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(correccion_cache, f, indent=2, ensure_ascii=False)

# 🌱 Cargar entorno
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("❌ No se encontró la API Key. Revisa tu archivo .env.")

# 🚀 Inicializar Flask
app = Flask(__name__)
CORS(app)

# 🧠 Configurar embeddings y modelos GPT
embedding = OpenAIEmbeddings(
    model="text-embedding-3-small",
    openai_api_key=openai_api_key
)

llm = ChatOpenAI(model="gpt-4o", openai_api_key=openai_api_key, temperature=0)
corrector_llm = ChatOpenAI(model="gpt-4o", openai_api_key=openai_api_key, temperature=0)
parafrasis_llm = ChatOpenAI(model="gpt-4o", openai_api_key=openai_api_key, temperature=0)

# 📦 FAISS dinámico por especialidad
vectordbs = {}

# 📜 Prompt base
prompt_template = """
Estás actuando como un asistente especializado en el tema de {especialidad_formateada}, enfocado en resolver preguntas de estudiantes de ciencias de la salud sobre este tema. 
Tu conocimiento se basa exclusivamente en libros, decretos, resoluciones y guías clínicas oficiales previamente cargadas al sistema.

⚠️ Este chat está dedicado al tema de: {especialidad_formateada}.

Tu tarea es responder exclusivamente basándote en el siguiente contexto proporcionado. 
No debes inventar información ni extrapolar más allá de lo que esté explícitamente respaldado en los documentos proporcionados.

Si es posible, incluye citas textuales o referencias directas del contenido para respaldar tus respuestas. 
Las citas deben ir entre comillas ("").

Formato de respuesta:
Respuesta:
Contexto: [Resumen del contenido más relevante]
Justificación: [Explicación o referencia basada en el contenido del documento, incluyendo citas textuales si corresponde]

Contexto:
{context}

Pregunta:
{question}
"""

# 🧹 Corrección ortográfica + filtro sensible
def corregir_ortografia_gpt(texto):
    texto_limpio = texto.lower().strip()

    if any(palabra in texto_limpio for palabra in PALABRAS_SENSIBLES):
        mensaje = "⚠️ Pregunta sensible detectada. Derivando a mensaje de apoyo."
        print(mensaje)
        logging.warning(mensaje)
        return (
            "Si estás atravesando un momento difícil, es muy importante que hables con alguien de confianza "
            "o busques apoyo profesional. No estás solo/a. Comunícate con una línea de ayuda en tu país o acude a un profesional de salud mental."
        )

    if texto in correccion_cache:
        print("⚡ Recuperando corrección de cache (memoria/disco).")
        return correccion_cache[texto]

    prompt_correccion = PromptTemplate(
        input_variables=["texto"],
        template=(
            "Corrige únicamente errores ortográficos o gramaticales en el siguiente texto en español. "
            "No agregues consejos, emociones ni explicaciones. Devuelve el texto corregido, o igual si no hay errores:\n\n"
            "Texto: {texto}\n\nTexto corregido:"
        )
    )

    chain = LLMChain(llm=corrector_llm, prompt=prompt_correccion)
    respuesta = chain.run({"texto": texto}).strip()

    correccion_cache[texto] = respuesta
    guardar_cache()
    print("💾 Corrección nueva almacenada en cache y guardada en disco.")
    return respuesta

# 🔁 Paráfrasis inteligente con GPT
def parafrasear_pregunta(texto, tema):
    prompt = PromptTemplate(
        input_variables=["pregunta", "tema"],
        template=(
            "Estás reformulando una pregunta de un estudiante sobre el tema de {tema}. "
            "Tu objetivo es que la pregunta sea más clara, directa y específica, "
            "pero sin añadir información nueva ni extender su contenido. "
            "Solo mejora la redacción si es necesario. "
            "Si ya es clara, repítela igual.\n\n"
            "Pregunta original: {pregunta}\n\nPregunta reformulada:"
        )
    )
    chain = LLMChain(llm=parafrasis_llm, prompt=prompt)
    return chain.run({"pregunta": texto, "tema": tema}).strip()

# 🔄 RAG Fusion - combinar resultados de reformulaciones
def recuperar_fragmentos_fusionados(pregunta, retriever):
    reformulaciones = [
        pregunta,
        f"¿Qué significa {pregunta} en el contexto de salud pública?",
        f"¿Cuál es el propósito o función de {pregunta}?",
        f"Explica el rol de {pregunta} en el sistema de salud."
    ]

    documentos = []
    for reformulada in reformulaciones:
        docs = retriever.get_relevant_documents(reformulada)
        documentos.extend(docs)

    # Eliminar duplicados conservando orden
    vistos = set()
    docs_unicos = []
    for doc in documentos:
        if doc.page_content not in vistos:
            vistos.add(doc.page_content)
            docs_unicos.append(doc)

    return docs_unicos

# 🚪 Endpoint dinámico
@app.route("/chat/<especialidad>", methods=["POST"])
def chat_especialidad(especialidad):
    data = request.get_json()
    question = data.get("question", "")

    if not question:
        return jsonify({"error": "Falta la pregunta"}), 400

    try:
        question_corregida = corregir_ortografia_gpt(question)
        especialidad_formateada = especialidad.replace("_", " ").capitalize()
        pregunta_final = parafrasear_pregunta(question_corregida, especialidad_formateada)

        print(f"🔵 Especialidad solicitada: {especialidad}")
        print(f"🔵 Pregunta original: {question}")
        print(f"🔵 Pregunta corregida: {question_corregida}")
        print(f"🔵 Pregunta reformulada: {pregunta_final}")

        if especialidad not in vectordbs:
            faiss_path = f"data/{especialidad}"
            if not os.path.exists(faiss_path):
                return jsonify({"error": f"La especialidad '{especialidad}' no existe en el servidor."}), 404
            vectordb = FAISS.load_local(faiss_path, embedding, allow_dangerous_deserialization=True)
            vectordbs[especialidad] = vectordb
            print(f"✅ FAISS cargado para {especialidad}.")
        else:
            vectordb = vectordbs[especialidad]

        retriever = vectordb.as_retriever(search_type="similarity", search_kwargs={"k": 4})

        # Fusionar fragmentos con RAG Fusion
        documentos = recuperar_fragmentos_fusionados(pregunta_final, retriever)
        contexto = "\n\n".join([doc.page_content for doc in documentos])

        dynamic_prompt = PromptTemplate(
            template=prompt_template,
            input_variables=["context", "question", "especialidad_formateada"]
        )

        qa_chain = LLMChain(
            llm=llm,
            prompt=dynamic_prompt.partial(especialidad_formateada=especialidad_formateada)
        )

        result = qa_chain.run({"context": contexto, "question": pregunta_final})
        return jsonify({"respuesta": result})

    except Exception as e:
        logging.error(f"❌ Error en /chat/{especialidad}: {str(e)}")
        return jsonify({"error": str(e)}), 500

# 📄 Endpoint para devolver títulos de documentos
@app.route("/titulos/<especialidad>", methods=["GET"])
def obtener_titulos(especialidad):
    ruta_txt = os.path.join("data", especialidad, "titulos.txt")
    if not os.path.exists(ruta_txt):
        return jsonify({"error": f"No se encontró el archivo de títulos para '{especialidad}'."}), 404

    with open(ruta_txt, "r", encoding="utf-8") as f:
        titulos = [line.strip() for line in f.readlines() if line.strip()]

    return jsonify({"especialidad": especialidad, "titulos": titulos})

if __name__ == "__main__":
    correccion_cache = cargar_cache()
    print(f"🔵 Cache de correcciones cargada ({len(correccion_cache)} entradas).")
    app.run(debug=True)
