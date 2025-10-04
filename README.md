<h1 align="center">HarvestChain🐟</h1>
<h3 align="center">Financial inclusion for Filipino Fisherfolk</h3>

<div align="center">
   
   [![Introduction](https://img.shields.io/badge/Introduction-blue)](#introduction)
   [![Features](https://img.shields.io/badge/Features-green)](#features)
   [![Technologies](https://img.shields.io/badge/Technologies-orange)](#technologies)
   [![Setup](https://img.shields.io/badge/Setup-purple)](#setup)
   [![Authors](https://img.shields.io/badge/Authors-gray)](#authors)
   
</div>

## Introduction
This project is a demo platform of our solution HarvestChain for the [APRU Tech Policy Hackathon 2025](https://www.apru.org/event/apru-tech-policy-hackathon-2025/).  
HarvestChain is a blockchain-based digital platform that creates financial inclusion for marginalized Filipino fisherfolk by addressing systemic economic barriers such as lack of national identification, middleman exploitation and volatile income.
<br>

| Barrier | Consequence |
|---------|-------------|
| **Lack of National Identification** | Unable to access formal banking services or government subsidies |
| **Middleman Exploitation** | Fisherfolk receive only **30-50%** of actual market value, losing significant income to intermediaries |
| **Volatile Income** | Monthly income fluctuations up to **70%**, making financial planning impossible and trapping families in debt cycles |

<br>
For the demo, HarvestChain was simplified to present a proof of concept. The demo has 2 main users, Fishermen and Buyers, who are able to create sell and buy smart-contracts to transact on the platform. The platform also offers AI credit scoring, AI smart-contract price helping and pooled lending or insurance services to fishermen.  

With its features, HarvestChain aims to break the chains of poverty by providing fisherfolk with verifiable identities, stable incomes, and an escape from predatory lending.

## Features

### Core Demo platform features
- Self Sovereign Identity(SSI): a blockchain-based verifiable credential that allows financial data collection on fishermen for access of formal financial services in the future
- Micro-Futures Smart Contracts: contracts on a futures market that let fisherfolk lock in prices today for tomorrow's catch, eliminating income volatility and middleman exploitation
- AI Credit Scoring: AI-driven financial profiling that turns fishing history into collateral, making formal loans accessible for the first time
- AI Pricing Helper: Real-time market intelligence that ensures fair valuation and prevents price manipulation by buyers and informational asymmetry
- Pooled Lending and Insurance: Risk-sharing collectives where fisherfolk access affordable credit and protection by leveraging group reliability instead of individual collateral

## Technologies

### Frontend
<p align="left"> <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"> <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"> <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"> </p>

### Backend
<p align="left"> <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask"> <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"> </p>

### Database
<p align="left"> <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"> </p>

### Blockchain & Web3
<p align="left"> <img src="https://img.shields.io/badge/XRPL-3C3C3D?style=for-the-badge&logo=XRPL&logoColor=white" alt="XRPL"> <img src="https://img.shields.io/badge/Hardhat-FFF100?style=for-the-badge&logo=hardhat&logoColor=black" alt="Hardhat"> <img src="https://img.shields.io/badge/MetaMask-FF7B00?style=for-the-badge&logo=metamask&logoColor=white" alt="MetaMask"> </p>

## Setup
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
5. Create a `.env.local` file in the root directory and add your Openrouter API key:
   ```
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```
6. Run the development server:
   ```
   npm run dev
   ```
## Authors

- [@kyashp](https://github.com/kyashp)
- [@sanjey99](https://github.com/sanjey99)
- [@ongxinchun](https://github.com/ongxinchun)
- [@thecalebloo](https://github.com/thecalebloo)
- [@leejiajunisaac](https://github.com/leejiajunisaac)
