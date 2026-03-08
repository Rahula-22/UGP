# 🧠 Mental Health AI Companion

A RAG (Retrieval-Augmented Generation) based AI chatbot that provides mental health support by answering queries related to mental health. Built with Python, FastAPI, React, and Groq AI.

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![React](https://img.shields.io/badge/React-18+-61DAFB.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## ✨ Features

- 🤖 **AI-Powered Chat**: Uses Groq's fast LLM for natural language responses
- 📚 **Document RAG**: Retrieves relevant information from uploaded PDF documents
- 🎨 **Modern UI**: Beautiful React frontend with Tailwind CSS
- ⚡ **Fast**: FAISS vector database for millisecond similarity search
- 🔒 **Private**: Runs completely locally with your own API key
- 📄 **Source Tracking**: Shows which documents were used for each answer

## 🏗️ Architecture

The application is built using a modular microservices architecture:

- **Frontend**: React app for user interface
- **Backend**: FastAPI for serving the model and processing requests
- **Vector Database**: FAISS for efficient similarity search
- **LLM**: Groq AI's language model for generating responses

## 📦 Installation & Setup

To run the project locally, follow these steps:

1. **Clone the repository**
   ```bash
   git clone https://github.com/Rahul-a22/mental-health-ai-companion.git
   cd UGP
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install Node.js dependencies (for frontend)**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Set up environment variables**
   - Create a `.env` file in the root directory
   - Add your OpenAI API key: `OPENAI_API_KEY=your_api_key_here`

5. **Run the backend server**
   ```bash
   python api.py
   ```

6. **Run the frontend development server**
   ```bash
   cd frontend
   npm start
   ```

7. **Open your browser**
   - Navigate to `http://localhost:3000` for the frontend
   - The backend API will be running at `http://localhost:8000`

## 📄 Usage

1. **Upload PDF documents**
   - Use the "Upload" button to select PDF files from your computer
   - Supported formats: PDF

2. **Ask questions**
   - Type your question in the input box
   - Press "Enter" or click the "Send" button
   - The AI will respond with relevant information from the documents

3. **View source documents**
   - Click on the "Sources" button in the response card
   - A modal will open, showing the list of documents used for the answer

## 🛠️ Development

To contribute to the project, follow these guidelines:

- Use `git` for version control
- Create a new branch for each feature or bugfix
- Follow the existing code style and conventions
- Write clear, concise commit messages
- Submit a pull request for review

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Acknowledgments

- Inspired by the need for accessible mental health support
- Built with ❤️ by [Rahul Ahirwar](https://github.com/Rahula-22)
- Special thanks to the contributors and supporters of this project

