from typing import Dict, Any, List
import os
from dotenv import load_dotenv
import logging
from langchain_openai import OpenAIEmbeddings
from langchain_openai import ChatOpenAI
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import PromptTemplate
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import DirectoryLoader, TextLoader, UnstructuredPDFLoader
from langchain.chains import RetrievalQA
import asyncio
from functools import lru_cache
import time

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class RAGService:
    def __init__(self):
        try:
            logger.debug("Loading environment variables...")
            load_dotenv()
            self.api_key = os.getenv("OPENAI_API_KEY")
            
            if not self.api_key:
                raise ValueError("OPENAI_API_KEY not found in environment variables")
            
            logger.debug("Initializing OpenAI embeddings...")
            self.embeddings = OpenAIEmbeddings(
                api_key=self.api_key,
                chunk_size=1000,  # Process more text at once
                max_retries=1     # Reduce wait time for retries
            )
            
            logger.debug("Initializing ChatOpenAI...")
            self.llm = ChatOpenAI(
                temperature=0.7,
                model_name="gpt-4",
                api_key=self.api_key,
                max_tokens=150,    # Limit response length for faster replies
                request_timeout=10  # Timeout shorter
            )
            
            self.vector_store = None
            
            # RAG prompt template
            self.rag_template = """Answer concisely based on context. If unsure, say "UNKNOWN".
            Context: {context}
            Question: {question}
            Answer:"""
            
            # OpenAI fallback prompt
            self.openai_template = """Be concise:
            Question: {question}
            Answer:"""
            
            self.QA_CHAIN_PROMPT = PromptTemplate(
                input_variables=["context", "question"],
                template=self.rag_template,
            )
            
            self.OPENAI_PROMPT = PromptTemplate(
                input_variables=["question"],
                template=self.openai_template,
            )
            
            # Pre-initialize vector store
            asyncio.create_task(self.initialize_vector_store())
            
            logger.info("RAG Service initialized successfully")
            
        except Exception as e:
            logger.error(f"Error in RAG Service initialization: {str(e)}")
            raise

    @lru_cache(maxsize=1)  # Cache the vector store
    async def initialize_vector_store(self, docs_dir: str = "ai_call_agent/data/docs"):
        try:
            if self.vector_store:
                return
                
            start_time = time.time()
            logger.info("Starting vector store initialization...")
            
            logger.debug(f"Checking documents directory: {docs_dir}")
            if not os.path.exists(docs_dir):
                logger.error(f"Documents directory not found: {docs_dir}")
                raise FileNotFoundError(f"Directory not found: {docs_dir}")
            
            logger.debug("Looking for PDF files...")
            pdf_files = [f for f in os.listdir(docs_dir) if f.endswith('.pdf')]
            logger.info(f"Found PDF files: {pdf_files}")
            
            if not pdf_files:
                raise FileNotFoundError("No PDF files found in documents directory")
            
            documents = []
            for filename in pdf_files:
                file_path = os.path.join(docs_dir, filename)
                logger.debug(f"Loading PDF: {file_path}")
                loader = UnstructuredPDFLoader(file_path)
                doc_pages = loader.load()
                logger.info(f"Loaded {len(doc_pages)} pages from {filename}")
                documents.extend(doc_pages)
            
            logger.debug("Splitting documents...")
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=300,     # Smaller chunks
                chunk_overlap=30,    # Less overlap
                length_function=len  # Simple length function
            )
            texts = text_splitter.split_documents(documents)
            logger.info(f"Split into {len(texts)} chunks")
            
            logger.debug("Creating vector store...")
            self.vector_store = FAISS.from_documents(
                texts, 
                self.embeddings,
                normalize_L2=True  # Optimization for search
            )
            
            end_time = time.time()
            logger.info(f"Vector store initialized in {end_time - start_time:.2f} seconds")
            
        except Exception as e:
            logger.error(f"Error in initialize_vector_store: {str(e)}")
            raise

    async def get_openai_response(self, query: str) -> str:
        """Get direct response from OpenAI"""
        try:
            # English prompt for all responses
            prompt = f"""You are an AI assistant providing accurate and consistent information.
            
            Response Rules:
            1. Always respond in the same language as the question
            2. Use reliable sources (World Population Review, UN)
            3. Include the year for statistics
            4. Structure responses clearly
            5. If uncertain, explicitly state lack of exact information
            
            Global Statistics Reference:
            - Global Population: 8.1 billion (2024, World Population Review)
            - Countries: 195 (UN: 193 members + 2 observers)
            
            Question: {query}
            
            Provide a clear, structured response.
            """
            
            response = await self.llm.apredict(prompt)
            return response
        except Exception as e:
            logger.error(f"OpenAI error: {str(e)}")
            return "Sorry, I cannot access this information at the moment."

    async def get_response(self, query: str) -> Dict[str, Any]:
        try:
            start_time = time.time()
            
            # Standard response patterns (bilingual)
            standard_responses = {
                # Romanian patterns
                "populatia globului": "According to World Population Review, the global population in 2024 is approximately 8.1 billion people.",
                "cate tari": "There are 195 countries in the world, according to UN data. This includes 193 UN member states and 2 observer states: Vatican City and Palestine.",
                "cati oameni": "According to World Population Review, the global population in 2024 is approximately 8.1 billion people.",
                
                # English patterns
                "global population": "According to World Population Review, the global population in 2024 is approximately 8.1 billion people.",
                "how many countries": "There are 195 countries in the world, according to UN data. This includes 193 UN member states and 2 observer states: Vatican City and Palestine.",
                "world population": "According to World Population Review, the global population in 2024 is approximately 8.1 billion people."
            }
            
            # Check for standard responses
            for key in standard_responses:
                if key in query.lower():
                    return {
                        "text": standard_responses[key],
                        "source": "Standard Response",
                        "time": f"{time.time() - start_time:.2f}s"
                    }
            
            # Keywords for different types of questions (bilingual)
            stats_keywords = [
                # Romanian
                'cati', 'cate', 'numar', 'cifra', 'populatie', 'exacta',
                # English
                'how many', 'number', 'population', 'exact', 'total', 'count'
            ]
            
            comparison_keywords = [
                # Romanian
                'compara', 'diferenta', 'versus', 'fata de',
                # English
                'compare', 'difference', 'versus', 'vs', 'between'
            ]
            
            is_stats = any(keyword in query.lower() for keyword in stats_keywords)
            is_comparison = any(keyword in query.lower() for keyword in comparison_keywords)
            
            if is_stats or is_comparison:
                answer = await self.get_openai_response(query)
                return {
                    "text": answer,
                    "source": "OpenAI (Direct)",
                    "time": f"{time.time() - start_time:.2f}s"
                }
            
            # RAG for specific questions
            if not self.vector_store:
                await self.initialize_vector_store()
            
            qa_chain = RetrievalQA.from_chain_type(
                llm=self.llm,
                chain_type="stuff",
                retriever=self.vector_store.as_retriever(
                    search_kwargs={"k": 2}
                ),
                chain_type_kwargs={
                    "prompt": self.QA_CHAIN_PROMPT
                },
                return_source_documents=True
            )
            
            response = await qa_chain.acall({"query": query})
            answer = response["result"]
            
            # Check for RAG fallback conditions (bilingual)
            fallback_phrases = [
                # Romanian
                "nu pot", "nu am", "nu știu",
                # English
                "cannot", "don't know", "unknown"
            ]
            
            if any(phrase in answer.lower() for phrase in fallback_phrases):
                logger.info("Using OpenAI for better response")
                openai_answer = await self.get_openai_response(query)
                return {
                    "text": openai_answer,
                    "source": "OpenAI",
                    "time": f"{time.time() - start_time:.2f}s"
                }
            
            return {
                "text": answer,
                "source": "RAG",
                "time": f"{time.time() - start_time:.2f}s"
            }
            
        except Exception as e:
            logger.error(f"Response error: {str(e)}")
            answer = await self.get_openai_response(query)
            return {
                "text": answer,
                "source": "OpenAI (Fallback)",
                "time": f"{time.time() - start_time:.2f}s"
            } 