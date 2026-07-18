# Pathora - Local AI Career Intelligence and ATS System

## Project Vision and Scope
Pathora is a closed-loop, privacy-first career intelligence and Applicant Tracking System (ATS) platform designed to operate entirely on local infrastructure. By leveraging open-source Large Language Models (LLMs) and vector database technologies, the system parses, indexes, and matches unstructured candidate resume data against job descriptions using Natural Language Processing (NLP). It identifies technical skill gaps, generates custom career development roadmaps, and simulates target interviews. Pathora is architected to prioritize data confidentiality (ensuring GDPR/KVKK compliance) by eliminating dependencies on external cloud APIs and processing all personally identifiable information (PII) on-premise.

## Architecture and Tech Stack

### AI and Data Persistence Layer
* Large Language Model (LLM): Llama 3.1 (8B) via Ollama for local text generation and semantic reasoning.
* Text Embedding Model: Nomic-Embed-Text for high-dimensional vector representations of textual data.
* Vector Database: ChromaDB for local persistent vector storage and semantic search integration within a Retrieval-Augmented Generation (RAG) pipeline.

### Backend and Core Logic
* Programming Runtime: Python (3.10 - 3.12)
* Document Parsing: PyMuPDF for high-fidelity text extraction from unstructured PDF documents.
* Text Splitting: LangChain Text Splitters for context window optimization via recursive character chunking.
* Data Validation: Pydantic for strict schema enforcement and model definitions.

### Frontend and Interface
* Analytical Dashboard: Streamlit for a reactive, data-driven analytical web interface.
* Product Showcase: React, TypeScript, Tailwind CSS, Framer Motion, and React Three Fiber (R3F) for a WebGL-accelerated static landing page.

## Core Capabilities and System Features

### Deterministic ATS Engine
Calculates keyword matching density and structural layout integrity in milliseconds without incurring LLM inference latency. It cross-references extracted candidate credentials against a specialized, bilingual taxonomy of technical and soft skills, providing instant feedback on keyword coverage.

### Context-Aware RAG Pipeline
Vectorizes document chunks and indexes them in ChromaDB. When user queries are processed, the system retrieves only the most semantically relevant text fragments to feed into the LLM context. This targeted injection prevents model hallucinations and maintains high coherence even across complex, long-form resumes.

### Privacy-Preserving Execution
No external API requests are dispatched to third-party cloud services. All computations, indexing, and text generations are resolved locally on the host machine, mitigating data leak risks and satisfying strict corporate security baselines.

### Comprehensive Career Intelligence Outputs
Orchestrates raw analytical data into structured, actionable reports:
* Technical Skill Gap Identification
* Multi-Dimensional Career Path Roadmapping
* Role-Specific Motivation Letter Synthesis
* Tailored Behavioral and Technical Interview Simulation Sets
* Structured HTML and Markdown Report Exporting


---

## Developed By

This repository is officially developed and verified by [Softbridge Solutions](https://softbridge-solutions-main-web-app-iota.vercel.app), an AI-first technology company founded in Adana, Türkiye.
