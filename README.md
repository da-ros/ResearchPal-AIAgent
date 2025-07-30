# ResearchPal - AI-Powered Research Assistant

A cutting-edge AI-powered research assistant that combines advanced language models, vector databases, and modern web technologies to help researchers discover, analyze, and manage scientific literature through an intuitive conversational interface.

## 🚀 Key Features

- **🤖 AI Chat Interface**: Conversational AI assistant powered by LangChain and Fireworks AI
- **🔍 Intelligent Paper Search**: Semantic search using OpenAI embeddings and MongoDB vector database
- **📚 Library Management**: Personal research library with tagging and organization
- **📱 Progressive Web App (PWA)**: Modern, responsive interface with offline capabilities
- **🔄 Real-time Integration**: Seamless API communication between frontend and backend
- **💾 Persistent Memory**: Conversation history and user preferences stored in MongoDB

## 🛠️ Technical Architecture

### **Backend Technologies**
- **FastAPI**: High-performance Python web framework with automatic API documentation
- **LangChain**: Advanced AI agent framework with tool-calling capabilities
- **MongoDB Atlas**: Cloud-based vector database for semantic search and conversation storage
- **Fireworks AI**: Enterprise-grade LLM with **LLaMA 4 Scout** as the main model for intelligent responses
- **OpenAI Embeddings**: State-of-the-art text embeddings for semantic search
- **arXiv Integration**: Real-time access to scientific paper metadata

### **Frontend Technologies**
- **React 18**: Latest React with concurrent features and improved performance
- **TypeScript**: Type-safe development with strict mode configuration
- **Vite**: Lightning-fast build tool and development server
- **shadcn/ui**: Modern, accessible UI components
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **React Router**: Client-side routing with navigation state management
- **Progressive Web App (PWA)**: Offline capabilities and native app experience

### **AI & ML Integration**
- **LangChain Agent**: Tool-calling agent with conversation memory
- **LLaMA 4 Scout**: Advanced language model for intelligent responses and reasoning
- **Vector Search**: Semantic similarity search using OpenAI embeddings
- **Conversation Memory**: Persistent chat history with MongoDB
- **Tool Orchestration**: Intelligent routing between search and detail tools

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React PWA     │    │   FastAPI       │    │   MongoDB       │
│   Frontend      │◄──►│   Backend       │◄──►│   Atlas         │
│                 │    │                 │    │                 │
│ • TypeScript    │    │ • LangChain     │    │ • Vector Store  │
│ • shadcn/ui     │    │ • Fireworks AI  │    │ • Chat History  │
│ • Tailwind CSS  │    │ • LLaMA 4 Scout │    │ • User Data     │
│ • PWA Features  │    │ • OpenAI Embed  │    │                 │
│                 │    │ • arXiv API     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** and npm
- **Python 3.8+**
- **MongoDB Atlas** account (for vector database)
- **OpenAI API** key (for embeddings)
- **Fireworks AI** API key (for LLM)

### Quick Setup

1. **Clone and Install**
   ```bash
   git clone https://github.com/da-ros/ResearchPal-AIAgent.git
   cd ResearchPal-AIAgent
   
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd Backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Environment Configuration**
   
   Create `Backend/.env`:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   FIREWORKS_API_KEY=your_fireworks_api_key_here
   MONGO_URI=your_mongodb_atlas_connection_string_here
   ```

3. **Start the Application**
   ```bash
   # Terminal 1: Start Backend
   cd Backend
   source venv/bin/activate
   python run_server.py
   
   # Terminal 2: Start Frontend
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## 🎯 Core Functionality

### **AI Chat Assistant**
- **Conversational Interface**: Natural language interaction with research context
- **Tool Integration**: Seamless switching between search and detail tools
- **Memory Persistence**: Maintains conversation context across sessions
- **Error Handling**: Graceful fallbacks and user feedback

### **Intelligent Search**
- **Semantic Search**: Find papers by meaning, not just keywords
- **Real-time Results**: Instant paper recommendations
- **Save to Library**: One-click paper saving with tags
- **Recent Searches**: Track and revisit previous queries

### **Library Management**
- **Personal Collection**: Save and organize research papers
- **Tag System**: Categorize papers by topic and interest
- **Filter & Sort**: Find papers quickly with advanced filtering
- **Export Options**: Share and backup your research

### **Paper Details**
- **Rich Metadata**: Complete paper information and abstracts
- **PDF Access**: Direct links to paper PDFs
- **Citation Data**: DOI, journal references, and publication dates
- **Save Integration**: Add papers to library from detail view

## 🔧 API Integration

### **RESTful API Design**
```typescript
// Chat with AI Assistant
POST /api/chat
{
  "message": "Find papers on transformers",
  "session_id": "optional-session-id"
}

// Search Papers
POST /api/search
{
  "query": "neural networks"
}

// Library Management
GET    /api/library          // Get saved papers
POST   /api/library          // Save paper
DELETE /api/library/{id}     // Remove paper
```

### **Real-time Communication**
- **WebSocket-ready**: Prepared for real-time updates
- **Error Recovery**: Automatic retry and fallback mechanisms
- **Loading States**: Smooth user experience during API calls
- **Toast Notifications**: Immediate feedback for all actions

## 🎨 User Experience

### **Modern UI/UX**
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark/Light Mode**: Automatic theme detection and switching
- **Accessibility**: WCAG compliant with keyboard navigation
- **Smooth Animations**: Micro-interactions for better engagement

### **Progressive Web App Features**
- **Offline Capability**: Core functionality works without internet
- **App-like Experience**: Install on home screen
- **Fast Loading**: Optimized bundle size and lazy loading
- **Push Notifications**: Ready for future notification features

## 🧪 Testing & Quality

### **Backend Testing**
```bash
# Test individual tools
cd Backend
python test_tools.py

# Test conversation memory
python test_memory.py

# API documentation
curl http://localhost:8000/docs
```

### **Frontend Testing**
```bash
# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📊 Performance & Scalability

### **Backend Performance**
- **FastAPI**: High-performance async framework
- **Vector Search**: Optimized similarity search
- **Caching**: Intelligent response caching
- **Connection Pooling**: Efficient database connections

### **Frontend Performance**
- **Vite**: Lightning-fast development and builds
- **Code Splitting**: Lazy-loaded components
- **Bundle Optimization**: Minimal bundle size
- **PWA Caching**: Intelligent resource caching

## 🔒 Security & Reliability

### **Security Features**
- **CORS Configuration**: Proper cross-origin resource sharing
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Secure error responses
- **API Rate Limiting**: Protection against abuse

### **Reliability Features**
- **Graceful Degradation**: App works with partial failures
- **Retry Logic**: Automatic retry for transient failures
- **Error Boundaries**: React error boundaries for UI stability
- **Logging**: Comprehensive logging for debugging

## 🚀 Deployment

### **Backend Deployment**
- **Docker Support**: Containerized deployment ready
- **Environment Variables**: Secure configuration management
- **Health Checks**: Built-in health monitoring
- **Auto-scaling**: Ready for cloud deployment

### **Frontend Deployment**
- **Static Hosting**: Deploy to any static hosting service
- **CDN Ready**: Optimized for content delivery networks
- **PWA Deployment**: Progressive web app features enabled
- **Build Optimization**: Production-ready builds

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Test thoroughly**
5. **Submit a pull request**

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **LangChain** for the AI agent framework
- **Fireworks AI** for the LLM capabilities
- **OpenAI** for the embedding technology
- **MongoDB Atlas** for the vector database
- **shadcn/ui** for the beautiful UI components
- **arXiv** for the scientific paper data

---

**ResearchPal** - Empowering researchers with AI-driven paper discovery and management. 🚀
