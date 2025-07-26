#!/usr/bin/env python3
"""
Test script to verify conversation memory is working correctly
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from api import get_session_history
from langchain.memory import ConversationBufferMemory

def test_conversation_memory():
    print("🧪 Testing conversation memory...")
    
    # Test session ID
    session_id = "test-session-123"
    
    try:
        # Create memory for this session
        memory = ConversationBufferMemory(
            memory_key="chat_history",
            chat_memory=get_session_history(session_id),
            return_messages=True  # This is the key fix
        )
        
        print(f"✅ Memory created for session: {session_id}")
        
        # Add some test messages
        from langchain_core.messages import HumanMessage, AIMessage
        
        # Add a human message
        memory.chat_memory.add_user_message("Find papers on transformers")
        print("✅ Added user message")
        
        # Add an AI message
        memory.chat_memory.add_ai_message("Here are some papers on transformers: 1. Paper A (arXiv ID: 2307.03456)")
        print("✅ Added AI message")
        
        # Check the messages
        messages = memory.chat_memory.messages
        print(f"📚 Current messages in memory: {len(messages)}")
        for i, msg in enumerate(messages):
            print(f"   {i+1}. {msg.type}: {msg.content[:50]}...")
        
        # Test retrieving memory
        memory_variables = memory.load_memory_variables({})
        print(f"📝 Memory variables: {memory_variables}")
        
        return True
        
    except Exception as e:
        print(f"❌ Memory test failed: {e}")
        return False

def test_memory_persistence():
    print("🧪 Testing memory persistence...")
    
    session_id = "test-persistence-456"
    
    try:
        # Create memory and add messages
        memory1 = ConversationBufferMemory(
            memory_key="chat_history",
            chat_memory=get_session_history(session_id)
        )
        
        memory1.chat_memory.add_user_message("Find papers on machine learning")
        memory1.chat_memory.add_ai_message("Here are papers: 1. Paper B (arXiv ID: 1707.04849v1)")
        
        print("✅ Added messages to memory")
        
        # Create a new memory instance for the same session
        memory2 = ConversationBufferMemory(
            memory_key="chat_history",
            chat_memory=get_session_history(session_id),
            return_messages=True  # This is the key fix
        )
        
        # Check if messages persist
        messages = memory2.chat_memory.messages
        print(f"📚 Retrieved {len(messages)} messages from persistent memory")
        
        for i, msg in enumerate(messages):
            print(f"   {i+1}. {msg.type}: {msg.content[:50]}...")
        
        return len(messages) == 2
        
    except Exception as e:
        print(f"❌ Memory persistence test failed: {e}")
        return False

def main():
    print("🚀 Testing ResearchPal conversation memory...")
    print("=" * 50)
    
    tests = [
        test_conversation_memory,
        test_memory_persistence
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 50)
    print(f"📊 Memory Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 Conversation memory is working correctly!")
    else:
        print("⚠️  Memory has issues. Check the logs above.")

if __name__ == "__main__":
    main() 