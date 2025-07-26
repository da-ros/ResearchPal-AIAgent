import os
import arxiv
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid
import re
from datetime import datetime

# Load the environment variables from the .env file
load_dotenv()

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
FIREWORKS_API_KEY = os.environ.get("FIREWORKS_API_KEY")
MONGO_URI = os.environ.get("MONGO_URI")

# Helper function to extract arXiv ID from text
def extract_arxiv_id(text: str) -> Optional[str]:
    """
    Extract arXiv ID from text using regex patterns.
    Supports various formats like 1707.04849v1, 1707.04849, etc.
    """
    # Pattern to match arXiv IDs
    patterns = [
        r'arxiv\.org/abs/(\d+\.\d+v?\d*)',
        r'arxiv\.org/pdf/(\d+\.\d+v?\d*)',
        r'arXiv ID: (\d+\.\d+v?\d*)',
        r'ID: (\d+\.\d+v?\d*)',
        r'(\d{4}\.\d{4,5}v?\d*)'  # General pattern for arXiv IDs
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1)
    
    return None

# Data ingestion into MongoDB vector database
from numpy import var
import pandas as pd
from datasets import load_dataset

data = load_dataset("MongoDB/subset_arxiv_papers_with_embeddings")
dataset_df = pd.DataFrame(data["train"])

from pymongo import MongoClient

# Initialize MongoDB python client
client = MongoClient(MONGO_URI)

DB_NAME = "agent_demo"
COLLECTION_NAME = "knowledge"
ATLAS_VECTOR_SEARCH_INDEX_NAME = "vector_index"
collection = client.get_database(DB_NAME).get_collection(COLLECTION_NAME)

print("Data ingestion into MongoDB completed")

# Create LangChain retriever with MongoDB
from langchain_openai import OpenAIEmbeddings
from langchain_mongodb import MongoDBAtlasVectorSearch

embedding_model = OpenAIEmbeddings(model="text-embedding-3-small", dimensions=256)

# Vector Store Creation
vector_store = MongoDBAtlasVectorSearch.from_connection_string(
    connection_string=MONGO_URI,
    namespace=DB_NAME + "." + COLLECTION_NAME,
    embedding=embedding_model,
    index_name=ATLAS_VECTOR_SEARCH_INDEX_NAME,
    text_key="abstract"
)

retriever = vector_store.as_retriever(search_type="similarity", search_kwargs={"k": 5})

# Configure LLM using Fireworks AI
from langchain_openai import ChatOpenAI
from langchain_fireworks import Fireworks, ChatFireworks

llm = ChatFireworks(
    model="accounts/fireworks/models/llama4-scout-instruct-basic",
    max_tokens=4096)

# Create tools for the agent
from langchain.agents import tool
from langchain.tools.retriever import create_retriever_tool
from langchain_community.document_loaders import ArxivLoader

@tool
def knowledge_base(query: str = "") -> str:
    """
    SEARCH FOR PAPERS BY TOPIC. Use this tool when the user asks to find papers on a specific topic or subject.
    Returns a list of research papers from the knowledge base that are semantically similar to the query.
    Each paper includes id, title, authors, and summary.
    """
    print(f"🔍 knowledge_base tool called with query: '{query}'")
    print(f"🔍 Query type: {type(query)}")
    
    if not query or query.strip() == "":
        return "No query provided. Please specify a topic to search for."
    
    try:
        docs = retriever.invoke(query)
        print(f"🔍 Retrieved {len(docs)} documents")
        
        if not docs:
            return "No relevant papers found."
        
        output = []
        for i, doc in enumerate(docs, 1):
            paper_id = doc.metadata.get('id', 'Unknown')
            output.append(
                f"{i}. Title: {doc.metadata.get('title')}\n"
                f"   Authors: {doc.metadata.get('authors')}\n"
                f"   arXiv ID: {paper_id}\n"
                f"   Summary: {doc.page_content[:300]}...\n"
            )
        result = "\n".join(output)
        print(f"🔍 knowledge_base tool returning {len(output)} papers")
        return result
    except Exception as e:
        print(f"❌ Error in knowledge_base tool: {str(e)}")
        return f"Error searching knowledge base: {str(e)}"

@tool
def get_metadata_information_from_arxiv(word: str) -> list:
    """
    GET METADATA FOR MULTIPLE PAPERS. Use this tool to fetch and return metadata for up to ten documents from arXiv that match a given query word.
    """
    try:
        search = arxiv.Search(
            query=word,
            max_results=10,
            sort_by=arxiv.SortCriterion.SubmittedDate
        )
        
        results = []
        for result in search.results():
            paper_info = {
                "title": result.title,
                "authors": [author.name for author in result.authors],
                "summary": result.summary,
                "published": result.published.strftime("%Y-%m-%d"),
                "arxiv_id": result.entry_id.split('/')[-1],
                "pdf_url": result.pdf_url,
                "categories": result.categories
            }
            results.append(paper_info)
        
        return results
    except Exception as e:
        return [{"error": f"Failed to fetch papers: {str(e)}"}]

@tool
def get_information_from_arxiv(id: str) -> str:
    """
    GET DETAILS ABOUT A SPECIFIC PAPER BY ITS ARXIV ID. Use this tool ONLY when the user asks for details about a specific paper that was mentioned in a previous response.
    Fetches and returns the abstract and detailed information for a single research paper from arXiv using the paper's ID.
    """
    try:
        # Extract arXiv ID if it's embedded in text
        arxiv_id = extract_arxiv_id(id)
        if not arxiv_id:
            arxiv_id = id.strip()
        
        print(f"🔍 Attempting to fetch paper with ID: {arxiv_id}")
        
        # Convert the ID format to match arXiv API expectations
        # Handle different formats like "712.2262" -> "0712.02262"
        if '.' in arxiv_id and len(arxiv_id.split('.')[0]) <= 3:
            # This looks like a short format, try to convert it
            parts = arxiv_id.split('.')
            if len(parts) == 2:
                year_part = parts[0]
                number_part = parts[1]
                
                # Handle different year formats
                if len(year_part) == 3:
                    # Format like "712" -> "0712"
                    year_part = "0" + year_part
                elif len(year_part) == 2:
                    year_num = int(year_part)
                    if year_num >= 50:  # 50-99 -> 1950-1999
                        year_part = "19" + year_part
                    else:  # 00-49 -> 2000-2049
                        year_part = "20" + year_part
                elif len(year_part) == 1:
                    year_part = "200" + year_part
                
                # Pad number part to 5 digits
                number_part = number_part.zfill(5)
                
                # Try the converted format
                converted_id = f"{year_part}.{number_part}"
                print(f"🔄 Converting arXiv ID from {arxiv_id} to {converted_id}")
                arxiv_id = converted_id
        
        # Search for the paper
        search = arxiv.Search(id_list=[arxiv_id])
        result = next(search.results(), None)
        
        if not result:
            # Try with the original ID if conversion failed
            if arxiv_id != id.strip():
                print(f"🔄 Trying original ID: {id.strip()}")
                search = arxiv.Search(id_list=[id.strip()])
                result = next(search.results(), None)
        
        if not result:
            return f"Paper with arXiv ID {arxiv_id} not found. Please check the ID format. The ID might be in a format that arXiv doesn't recognize."
        
        # Format the response with actual paper information
        response = f"""
**Paper Details:**

**Title:** {result.title}
**Authors:** {', '.join([author.name for author in result.authors])}
**arXiv ID:** {result.entry_id.split('/')[-1]}
**Published:** {result.published.strftime("%Y-%m-%d")}
**Categories:** {', '.join(result.categories)}

**Abstract:**
{result.summary}

**Additional Information:**
- **PDF URL:** {result.pdf_url}
- **Entry URL:** {result.entry_id}
- **Journal Reference:** {result.journal_ref if result.journal_ref else 'Not available'}
- **DOI:** {result.doi if result.doi else 'Not available'}

**Summary:**
This paper presents research in the field of {', '.join(result.categories)}. The work contributes to the understanding of {result.title.lower()} and provides insights into {', '.join(result.categories)}.
"""
        
        return response
        
    except Exception as e:
        return f"Error retrieving paper information: {str(e)}"

tools = [knowledge_base, get_metadata_information_from_arxiv, get_information_from_arxiv]

# Prompting the agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
agent_purpose = """
You are a helpful research assistant equipped with various tools to assist with your tasks efficiently. 
You have access to conversational history stored in your input as chat_history.

You have three tools available:

1. knowledge_base - SEARCH FOR PAPERS BY TOPIC
2. get_metadata_information_from_arxiv - GET METADATA FOR MULTIPLE PAPERS  
3. get_information_from_arxiv - GET DETAILS ABOUT A SPECIFIC PAPER BY ITS ARXIV ID

CRITICAL TOOL SELECTION RULES:

FOR TOPIC SEARCHES (use knowledge_base):
- When user asks: "Find papers on [topic]" → extract the topic and use knowledge_base
- When user asks: "Search for papers about [topic]" → extract the topic and use knowledge_base
- When user asks: "Get papers on [topic]" → extract the topic and use knowledge_base
- When user asks: "Show me papers about [topic]" → extract the topic and use knowledge_base
- When user asks: "What papers exist on [topic]" → extract the topic and use knowledge_base

FOR SPECIFIC PAPER DETAILS (use get_information_from_arxiv):
- When user asks for details about a specific paper mentioned in previous responses
- When user says: "I'd like a summary of the paper: [paper title]" → find the arXiv ID from previous responses
- When user asks: "Get details about paper 1" → find the arXiv ID from previous responses
- When user asks: "Tell me more about the first paper" → find the arXiv ID from previous responses
- When user asks: "Summarize paper 2" → find the arXiv ID from previous responses
- When user asks: "What is paper 3 about" → find the arXiv ID from previous responses

EXAMPLES:
- User: "Find papers on transformers" → USE knowledge_base with query="transformers"
- User: "Get papers on neural networks" → USE knowledge_base with query="neural networks"
- User: "Search for papers about BERT" → USE knowledge_base with query="BERT"
- User: "I'd like a summary of the paper: Adaptive thresholds for neural networks with synaptic noise" → USE get_information_from_arxiv with arXiv ID "708.0328" from previous response

IMPORTANT: 
- NEVER use get_information_from_arxiv for topic searches
- ALWAYS use knowledge_base for topic searches
- ALWAYS extract the topic/keyword from the user's message and pass it as the query parameter
- For specific paper requests, ALWAYS look in chat_history for the arXiv ID of the mentioned paper

For follow-up requests about specific papers:
- Look in the chat_history for previous responses that contain paper lists
- Find the paper title mentioned by the user
- Extract the arXiv ID from that paper in the previous response
- Use get_information_from_arxiv with that specific arXiv ID

REMEMBER: When someone asks for details about a specific paper, you MUST use get_information_from_arxiv with the arXiv ID from the previous conversation, not knowledge_base.
"""

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", agent_purpose),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
        MessagesPlaceholder("agent_scratchpad")
    ]
)

# Agent creation
from langchain.agents import AgentExecutor, create_tool_calling_agent
agent = create_tool_calling_agent(llm, tools, prompt)

# Create the agent's long-term memory using MongoDB
from langchain_mongodb.chat_message_histories import MongoDBChatMessageHistory
from langchain.memory import ConversationBufferMemory

def get_session_history(session_id: str) -> MongoDBChatMessageHistory:
    return MongoDBChatMessageHistory(MONGO_URI, session_id, database_name=DB_NAME, collection_name="history")

# FastAPI app setup
app = FastAPI(title="ResearchPal API", description="AI-powered research assistant API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://127.0.0.1:8080"],  # Frontend dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for API
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str

class SearchRequest(BaseModel):
    query: str

class Paper(BaseModel):
    id: str
    title: str
    authors: List[str]
    abstract: str
    subjects: List[str]
    date: str
    arxiv_id: Optional[str] = None

class SearchResponse(BaseModel):
    papers: List[Paper]
    total: int

class LibraryPaper(BaseModel):
    id: str
    title: str
    authors: List[str]
    abstract: str
    arxiv_id: str
    date_added: str
    tags: List[str] = []
    notes: str = ""

class LibraryRequest(BaseModel):
    arxiv_id: str
    title: str
    authors: List[str]
    abstract: str
    tags: List[str] = []
    notes: str = ""

class LibraryResponse(BaseModel):
    papers: List[LibraryPaper]
    total: int

# Simple in-memory storage for library (in production, this would be a database)
library_storage: dict[str, dict] = {}

@app.get("/")
async def root():
    return {"message": "ResearchPal API is running"}

@app.get("/debug/memory/{session_id}")
async def debug_memory(session_id: str):
    """Debug endpoint to check conversation memory for a session"""
    try:
        memory = ConversationBufferMemory(
            memory_key="chat_history",
            chat_memory=get_session_history(session_id),
            return_messages=True  # This is the key fix
        )
        
        messages = memory.chat_memory.messages
        return {
            "session_id": session_id,
            "message_count": len(messages),
            "messages": [
                {
                    "type": msg.type,
                    "content": msg.content[:200] + "..." if len(msg.content) > 200 else msg.content
                }
                for msg in messages
            ]
        }
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        session_id = request.session_id or str(uuid.uuid4())
        print(f"🔍 Processing chat request: {request.message}")
        print(f"📝 Session ID: {session_id}")
        
        # Create memory for this session
        memory = ConversationBufferMemory(
            memory_key="chat_history",
            chat_memory=get_session_history(session_id),
            return_messages=True
        )
        
        # Create agent executor with memory for this session
        agent_executor = AgentExecutor(
            agent=agent,
            tools=tools,
            verbose=False,  # Hide verbose output from user
            handle_parsing_errors=True,
            memory=memory,
        )
        
        # Debug: Print current conversation history
        current_messages = memory.chat_memory.messages
        print(f"📚 Current conversation history ({len(current_messages)} messages):")
        for i, msg in enumerate(current_messages[-3:]):  # Show last 3 messages
            print(f"   {i+1}. {msg.type}: {msg.content[:100]}...")
        
        # Debug: Show what the agent will receive
        memory_variables = memory.load_memory_variables({})
        print(f"📝 Memory variables for agent: {memory_variables}")
        
        # Invoke the agent
        result = agent_executor.invoke({"input": request.message})
        
        # Clean up the response to remove tool invocation artifacts
        cleaned_response = result["output"]
        
        # Remove tool invocation patterns that might still appear
        import re
        # Remove patterns like [tool_name(args)]assistant
        cleaned_response = re.sub(r'\[[^\]]+\]assistant\s*', '', cleaned_response)
        # Remove patterns like tool_name(args)assistant
        cleaned_response = re.sub(r'[a-zA-Z_]+\([^)]+\)assistant\s*', '', cleaned_response)
        # Remove any remaining "assistant" artifacts
        cleaned_response = re.sub(r'assistant\s*', '', cleaned_response)
        
        # Remove specific tool invocation patterns
        # Remove patterns like [get_information_from_arxiv(id="...")]
        cleaned_response = re.sub(r'\[get_information_from_arxiv\([^)]+\)\]', '', cleaned_response)
        # Remove patterns like [knowledge_base(query="...")]
        cleaned_response = re.sub(r'\[knowledge_base\([^)]+\)\]', '', cleaned_response)
        # Remove patterns like [get_metadata_information_from_arxiv(word="...")]
        cleaned_response = re.sub(r'\[get_metadata_information_from_arxiv\([^)]+\)\]', '', cleaned_response)
        
        # Clean up any extra whitespace
        cleaned_response = cleaned_response.strip()
        
        print(f"✅ Agent response: {cleaned_response[:200]}...")
        
        return ChatResponse(
            response=cleaned_response,
            session_id=session_id
        )
    except Exception as e:
        print(f"❌ Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@app.post("/api/search", response_model=SearchResponse)
async def search(request: SearchRequest):
    try:
        print(f"🔍 Processing search request: {request.query}")
        
        # Use the knowledge_base tool to search for papers
        search_result = knowledge_base.invoke(request.query)
        
        print(f"🔍 Raw search result from knowledge_base:")
        print(search_result)
        print("=" * 50)
        
        # Parse the search result to extract paper information
        papers = []
        
        # The knowledge_base tool returns format like:
        # "1. Title: Paper Title\n   Authors: Author1, Author2\n   arXiv ID: 1234.5678v1\n   Summary: Abstract text...\n"
        lines = search_result.split('\n')
        current_paper = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            print(f"🔍 Processing line: '{line}'")
                
            if re.match(r'^\d+\.\s*Title:', line):
                if current_paper: papers.append(current_paper)
                title = line.split('Title:', 1)[1].strip()
                current_paper = {"id": "", "title": title, "authors": [], "abstract": "", "subjects": [], "date": "2024-01-01", "arxiv_id": None}
                print(f"📝 Processing paper: {title}")
            elif line.startswith('Authors:'):
                if current_paper:
                    authors_text = line.replace('Authors:', '').strip()
                    current_paper["authors"] = [author.strip() for author in authors_text.split(',')]
                    print(f"👥 Authors: {authors_text}")
            elif line.startswith('arXiv ID:'):
                if current_paper:
                    arxiv_id = line.replace('arXiv ID:', '').strip()
                    current_paper["arxiv_id"] = arxiv_id
                    current_paper["id"] = arxiv_id
                    print(f"📄 Found paper with arXiv ID: {arxiv_id}")
            elif line.startswith('Summary:'):
                if current_paper:
                    summary = line.replace('Summary:', '').strip()
                    current_paper["abstract"] = summary
                    print(f"📖 Summary length: {len(summary)} chars")
            elif current_paper and line and not line.startswith('Title:') and not line.startswith('Authors:') and not line.startswith('arXiv ID:') and not line.startswith('Summary:') and not re.match(r'^\d+\.', line):
                if current_paper["abstract"]:
                    current_paper["abstract"] += " " + line.strip()
        
        if current_paper: papers.append(current_paper)
        
        if not papers or search_result.strip() == "No relevant papers found.":
            papers = [{"id": "no-papers-found", "title": f"No papers found for '{request.query}'", "authors": [], "abstract": "Try a different search term or check your spelling.", "subjects": [], "date": "2024-01-01", "arxiv_id": None}]
        
        for i, paper in enumerate(papers):
            if not paper["id"] or paper["id"] == "":
                paper["id"] = f"paper-{i+1}"
                paper["arxiv_id"] = f"paper-{i+1}"
                print(f"⚠️  Paper {i+1} has no arXiv ID, using fallback: {paper['id']}")
            else:
                print(f"✅ Paper {i+1} has arXiv ID: {paper['id']}")
        
        print(f"✅ Found {len(papers)} papers for query: {request.query}")
        return SearchResponse(papers=papers, total=len(papers))
    except Exception as e:
        print(f"❌ Error in search endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing search request: {str(e)}")

@app.get("/api/library", response_model=LibraryResponse)
async def get_library():
    """Get all papers in the user's library"""
    try:
        papers = []
        for arxiv_id, paper_data in library_storage.items():
            papers.append(LibraryPaper(
                id=arxiv_id,
                title=paper_data["title"],
                authors=paper_data["authors"],
                abstract=paper_data["abstract"],
                arxiv_id=arxiv_id,
                date_added=paper_data["date_added"],
                tags=paper_data.get("tags", []),
                notes=paper_data.get("notes", "")
            ))
        
        return LibraryResponse(papers=papers, total=len(papers))
    except Exception as e:
        print(f"❌ Error in get_library endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving library: {str(e)}")

@app.post("/api/library")
async def save_to_library(request: LibraryRequest):
    """Save a paper to the user's library"""
    try:
        print(f"💾 Saving paper to library: {request.title}")
        
        # Store the paper in memory
        library_storage[request.arxiv_id] = {
            "title": request.title,
            "authors": request.authors,
            "abstract": request.abstract,
            "date_added": datetime.now().isoformat(),
            "tags": request.tags or [],
            "notes": request.notes or ""
        }
        
        return {"message": "Paper saved to library", "arxiv_id": request.arxiv_id}
    except Exception as e:
        print(f"❌ Error in save_to_library endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error saving to library: {str(e)}")

@app.delete("/api/library/{arxiv_id}")
async def remove_from_library(arxiv_id: str):
    """Remove a paper from the user's library"""
    try:
        print(f"🗑️ Removing paper from library: {arxiv_id}")
        
        if arxiv_id in library_storage:
            del library_storage[arxiv_id]
            return {"message": "Paper removed from library", "arxiv_id": arxiv_id}
        else:
            raise HTTPException(status_code=404, detail="Paper not found in library")
    except Exception as e:
        print(f"❌ Error in remove_from_library endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error removing from library: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 