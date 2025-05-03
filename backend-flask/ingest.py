import os
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import FAISS
from langchain.embeddings import OpenAIEmbeddings

# Cargar variables del archivo .env
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("❌ No se encontró la API key en el archivo .env.")

# Configurar embeddings usando text-embedding-3-small
embedding = OpenAIEmbeddings(
    model="text-embedding-3-small",
    openai_api_key=openai_api_key
)

# Rutas de entrada y salida
pdf_base_path = "pdfs"
data_base_path = "data"

# Recorrer cada especialidad
for especialidad in os.listdir(pdf_base_path):
    ruta_especialidad = os.path.join(pdf_base_path, especialidad)
    if not os.path.isdir(ruta_especialidad):
        continue

    print(f"\n📚 Procesando especialidad: {especialidad}")
    all_docs = []

    # Recorrer subcarpetas dentro de la especialidad (guias, libros, etc.)
    for root, _, files in os.walk(ruta_especialidad):
        for file in files:
            if file.endswith(".pdf"):
                ruta_pdf = os.path.join(root, file)
                loader = PyPDFLoader(ruta_pdf)
                docs = loader.load()
                all_docs.extend(docs)

    if not all_docs:
        print(f"⚠️ No se encontraron PDFs para: {especialidad}")
        continue

    # Fragmentar textos
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=250)
    split_docs = splitter.split_documents(all_docs)

    # Crear base FAISS y guardar
    output_path = os.path.join(data_base_path, especialidad)
    vectordb = FAISS.from_documents(split_docs, embedding)
    vectordb.save_local(output_path)

    print(f"✅ Embeddings guardados correctamente en: {output_path}")