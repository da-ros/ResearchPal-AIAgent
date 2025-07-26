import os
import arxiv
from dotenv import load_dotenv

# Load the environment variables from the .env file
load_dotenv()

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
FIREWORKS_API_KEY = os.environ.get("FIREWORKS_API_KEY")
MONGO_URI = os.environ.get("MONGO_URI")

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

# Delete any existing records in the collection
# collection.delete_many({})

# # Data Ingestion
# records = dataset_df.to_dict('records')
# collection.insert_many(records)

print("Data ingestion into MongoDB completed")

# Create LangChain retriever with MongoDB
from langchain_openai import OpenAIEmbeddings
from langchain_mongodb import MongoDBAtlasVectorSearch

embedding_model = OpenAIEmbeddings(model="text-embedding-3-small", dimensions=256)

# Vector Store Creation
vector_store = MongoDBAtlasVectorSearch.from_connection_string(
    connection_string=MONGO_URI,
    namespace=DB_NAME + "." + COLLECTION_NAME,
    embedding= embedding_model,
    index_name=ATLAS_VECTOR_SEARCH_INDEX_NAME,
    text_key="abstract"
    )

retriever = vector_store.as_retriever(search_type="similarity", search_kwargs={"k": 5})

# Configure LLM using Fireworks AI
from langchain_openai import ChatOpenAI
from langchain_fireworks import Fireworks, ChatFireworks

llm = ChatFireworks(
    model="accounts/fireworks/models/llama4-scout-instruct-basic",
    max_tokens=256)

# Create tools for the agent
from langchain.agents import tool
from langchain.tools.retriever import create_retriever_tool
from langchain_community.document_loaders import ArxivLoader

@tool
def get_metadata_information_from_arxiv(word: str) -> list:
    """
    Fetches and returns metadata for a maximum of ten documents from arXiv matching the given query word.

    Args:
    word (str): The search query to find relevant documents on arXiv.

    Returns:
    list: Metadata about the documents matching the query.
    """

    search = arxiv.Search(query=word, max_results=10)
    results = []
    for result in search.results():
        results.append({
            "arxiv_id": result.entry_id.split('/')[-1],
            "title": result.title,
            "authors": [author.name for author in result.authors],
            "summary": result.summary,
            "url": result.entry_id
        })
    return results


@tool
def get_information_from_arxiv(id: str) -> list:
    """
    Fetches and returns the abstract or the entire paper for a single research paper from arXiv with the ID of the paper, for example: 704.0001.

    Args:
    id (str): The ID to find the relevant paper on arXiv.

    Returns:
    list: Data about the paper matching the query.
    """
    doc = ArxivLoader(query=id, load_max_docs=1).load()
    return doc

@tool
def knowledge_base(query: str) -> list:
    """
    Returns a list of research papers from the knowledge base that are semantically similar to the query.
    Each paper includes id, title, authors, and summary.
    """
    docs = retriever.invoke(query)
    if not docs:
        return "No relevant papers found."
    output = []
    for i, doc in enumerate(docs, 1):
        output.append(
            f"{i}. Title: {doc.metadata.get('title')}\n"
            f"   Authors: {doc.metadata.get('authors')}\n"
            f"   ID: {doc.metadata.get('id')}\n"
            f"   Summary: {doc.page_content[:300]}...\n"
        )
    return "\n".join(output)

tools = [knowledge_base, get_metadata_information_from_arxiv, get_information_from_arxiv]

# Prompting the agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
agent_purpose = """
You are a helpful research assistant equipped with various tools to assist with your tasks efficiently. 
You have access to conversational history stored in your inpout as chat_history.
Below are instructions on when and how to use each tool in your operations, but first when a user asks for a list of papers on a specific topic, use the `knowledge_base` tool to get the list.
When referencing a paper from a previous list, always extract the arxiv_id field and use it as input to the get_information_from_arxiv tool.

1. knowledge_base

Purpose: To serve as your base knowledge, containing records of research papers from arXiv.
When to Use: Use this tool as the first step for exploration and research efforts when dealing with topics covered by the documents in the knowledge base. If some papers are found, just return the list of papers, don't use the other tools.
Example: When beginning research on a new topic, first use this tool to access the relevant papers, if any.

2. get_metadata_information_from_arxiv

Purpose: To fetch and return metadata for up to ten documents from arXiv that match a given query word.
When to Use: Use this tool when you need to gather metadata about multiple research papers related to a specific topic, when the knowledge_base tool returns no papers.
Example: If you are asked to provide an overview of recent papers on "machine learning," use this tool to fetch metadata for relevant documents.

3. get_information_from_arxiv

Purpose: To fetch and return the abstract or the entire paper for a single research paper from arXiv using the paper's ID.
When to Use: When a user asks for the abstract of a paper from a previous list, extract the arXiv ID from the previous response and use it as input to "get_information_from_arxiv" tool.
Example: If you are asked to retrieve detailed information about the paper with the ID "704.0001", use this tool.



"""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", agent_purpose),
        ("human", "{input}"),
        MessagesPlaceholder("agent_scratchpad")
    ]
)

# Create the agent’s long-term memory using MongoDB
from langchain_mongodb.chat_message_histories import MongoDBChatMessageHistory
from langchain.memory import ConversationBufferMemory

def get_session_history(session_id: str) -> MongoDBChatMessageHistory:
    return MongoDBChatMessageHistory(MONGO_URI, session_id, database_name=DB_NAME, collection_name="history")

memory = ConversationBufferMemory(
    memory_key="chat_history",
    chat_memory=get_session_history("my-session-6")
)
print(memory.chat_memory.messages)

# Agent creation
from langchain.agents import AgentExecutor, create_tool_calling_agent
agent = create_tool_calling_agent(llm, tools, prompt)

agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
    handle_parsing_errors=True,
    memory=memory,
)

# Agent execution
# agent_executor.invoke({"input": "Get me a list of research papers on the topic *Prompt Injection*"})
# agent_executor.invoke({"input": "Get me the abstract of the first paper on the list"})


# Test tools
# if __name__ == "__main__":
    # # 1. Test knowledge_base
    # print("=== Testing knowledge_base ===")
    # kb_result = knowledge_base("Nuclear Power")
    # print(kb_result)

    # # 2. Test get_metadata_information_from_arxiv
    # print("\n=== Testing get_metadata_information_from_arxiv ===")
    # arxiv_meta_result = get_metadata_information_from_arxiv("Prompt Injection")
    # print(arxiv_meta_result)

    # # 3. Test get_information_from_arxiv
    # print("\n=== Testing get_information_from_arxiv ===")
    # # Use an ID from the previous result, or a known arXiv ID
    # arxiv_id = "2410.14827v2"
    # arxiv_info_result = get_information_from_arxiv(arxiv_id)
    # print(arxiv_info_result)
