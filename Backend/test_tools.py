#!/usr/bin/env python3
"""
Test script to verify the tools work correctly
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import the tools from api.py
from api import knowledge_base, get_metadata_information_from_arxiv, get_information_from_arxiv, extract_arxiv_id

def test_arxiv_id_extraction():
    print("🧪 Testing arXiv ID extraction...")
    test_cases = [
        ("arXiv ID: 1707.04849v1", "1707.04849v1"),
        ("ID: 1909.03550v1", "1909.03550v1"),
        ("https://arxiv.org/abs/1811.04422v1", "1811.04422v1"),
        ("Paper with ID 2307.03456", "2307.03456"),
        ("Some text with 2023.12345v2 in it", "2023.12345v2"),
    ]
    
    passed = 0
    for input_text, expected in test_cases:
        result = extract_arxiv_id(input_text)
        if result == expected:
            print(f"✅ '{input_text}' → '{result}'")
            passed += 1
        else:
            print(f"❌ '{input_text}' → '{result}' (expected '{expected}')")
    
    print(f"📊 arXiv ID extraction: {passed}/{len(test_cases)} tests passed")
    return passed == len(test_cases)

def test_knowledge_base():
    print("🧪 Testing knowledge_base tool...")
    try:
        result = knowledge_base("transformers")
        print(f"✅ knowledge_base result: {result[:200]}...")
        return True
    except Exception as e:
        print(f"❌ knowledge_base failed: {e}")
        return False

def test_get_metadata_from_arxiv():
    print("🧪 Testing get_metadata_information_from_arxiv tool...")
    try:
        result = get_metadata_information_from_arxiv("machine learning")
        print(f"✅ get_metadata_information_from_arxiv result: {len(result)} papers found")
        if result:
            print(f"   First paper: {result[0]['title'][:50]}...")
        return True
    except Exception as e:
        print(f"❌ get_metadata_information_from_arxiv failed: {e}")
        return False

def test_get_information_from_arxiv():
    print("🧪 Testing get_information_from_arxiv tool...")
    try:
        # Test with a known arXiv ID
        result = get_information_from_arxiv("2307.03456")
        print(f"✅ get_information_from_arxiv result: {result[:200]}...")
        return True
    except Exception as e:
        print(f"❌ get_information_from_arxiv failed: {e}")
        return False

def test_get_information_with_extraction():
    print("🧪 Testing get_information_from_arxiv with ID extraction...")
    try:
        # Test with text that contains an arXiv ID
        result = get_information_from_arxiv("arXiv ID: 1707.04849v1")
        print(f"✅ get_information_from_arxiv with extraction: {result[:200]}...")
        return True
    except Exception as e:
        print(f"❌ get_information_from_arxiv with extraction failed: {e}")
        return False

def main():
    print("🚀 Testing ResearchPal tools...")
    print("=" * 50)
    
    tests = [
        test_arxiv_id_extraction,
        test_knowledge_base,
        test_get_metadata_from_arxiv,
        test_get_information_from_arxiv,
        test_get_information_with_extraction
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tools are working correctly!")
    else:
        print("⚠️  Some tools have issues. Check the logs above.")

if __name__ == "__main__":
    main() 