# HarvestChain

HarvestChain is a blockchain-based platform designed to empower Filipino fisherfolk by providing a platform to sell their catch directly to consumers, eliminating middlemen and ensuring fair prices. The platform also incorporates financial products like pooled insurance and lending to further support the fishing community.

## Setup Instructions

In git bash or other terminal:

1. Clone the repository:
   ```
   git clone https://github.com/kyashp/harvestchain.git
   ```
2. Navigate to the project directory:
   ```
   cd harvestchain
   ```
3. Set up the Python virtual environment and install dependencies:
   ```
   python -m venv venv
   venv\Scripts\activate   # On Windows
   # or
   source venv/bin/activate  # On macOS/Linux
   pip install -r requirements.txt
   ```
4. Install Node.js dependencies:
   ```
   npm install
   ```
5. Create a `.env.local` file in the root directory and add your OpenAI API key:
   ```
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```
6. Run the development server:
   ```
   npm run dev
   ```
7. Run the Flask backend:
   ```
   python flask_ssi_backend.py
   ```

## AI Use

- ChatGPT was used for code debugging during the development of this project.
