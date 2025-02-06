from typing import Dict, Any
import os
from dotenv import load_dotenv
import logging
from langchain import LLMChain, PromptTemplate
from langchain.chat_models import ChatOpenAI
from langchain.memory import ConversationBufferMemory

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        load_dotenv()
        self.api_key = os.getenv("OPENAI_API_KEY")
        
        # Initialize LLM
        self.llm = ChatOpenAI(
            temperature=0.7,
            model_name="gpt-4",
            api_key=self.api_key
        )
        
        # Define prompt template
        template = """You are an AI Call Agent assistant. Be helpful and friendly.
        Previous conversation:
        {chat_history}
        
        Human: {human_input}
        Assistant:"""
        
        self.prompt = PromptTemplate(
            input_variables=["chat_history", "human_input"],
            template=template
        )
        
        # Initialize conversation memory
        self.memories: Dict[str, ConversationBufferMemory] = {}
        
    def get_memory(self, session_id: str) -> ConversationBufferMemory:
        if session_id not in self.memories:
            self.memories[session_id] = ConversationBufferMemory(
                memory_key="chat_history",
                return_messages=True
            )
        return self.memories[session_id]
        
    async def get_response(self, text: str, session_id: str) -> Dict[str, Any]:
        try:
            # Get memory for this session
            memory = self.get_memory(session_id)
            
            # Create chain
            chain = LLMChain(
                llm=self.llm,
                prompt=self.prompt,
                memory=memory,
                verbose=True
            )
            
            # Get response
            response = await chain.arun(human_input=text)
            
            return {
                "text": response,
                "session_id": session_id
            }
            
        except Exception as e:
            logger.error(f"Error in LLM service: {str(e)}")
            return {"error": str(e)} 