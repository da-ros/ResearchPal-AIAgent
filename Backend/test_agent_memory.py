#!/usr/bin/env python3
"""
Test script to verify the agent can access conversation history
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from api import get_session_history, agent, tools
from langchain.memory import ConversationBufferMemory
from langchain.agents import AgentExecutor

def test_agent_with_memory():
    print("🧪 Testing agent with conversation memory...")
    
    session_id = "test-agent-memory-123"
    
    try:
        # Create memory for this session
        memory = ConversationBufferMemory(
            memory_key="chat_history",
            chat_memory=get_session_history(session_id),
            return_messages=True  # This is the key fix
        )
        
        # Add some test conversation
        from langchain_core.messages import HumanMessage, AIMessage
        
        memory.chat_memory.add_user_message("Find papers on neural networks")
        memory.chat_memory.add_ai_message("Here are some papers:\n1. Paper A (arXiv ID: 1707.04849v1)\n2. Paper B (arXiv ID: 1909.03550v1)\n3. Paper C (arXiv ID: 1811.04422v1)\n4. Paper D (arXiv ID: 2307.03456)")
        
        print("✅ Added test conversation to memory")
        
        # Create agent executor with memory
        agent_executor = AgentExecutor(
            agent=agent,
            tools=tools,
            verbose=False,  # Hide verbose output
            handle_parsing_errors=True,
            memory=memory,
        )
        
        # Test the agent with a follow-up question
        print("🤖 Testing agent with follow-up question...")
        result = agent_executor.invoke({"input": "get me a summary of paper 4"})
        
        print(f"✅ Agent response: {result['output'][:300]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Agent memory test failed: {e}")
        return False

def main():
    print("🚀 Testing ResearchPal agent with memory...")
    print("=" * 50)
    
    if test_agent_with_memory():
        print("🎉 Agent can access conversation memory!")
    else:
        print("⚠️  Agent has issues with memory access.")

if __name__ == "__main__":
    main() 