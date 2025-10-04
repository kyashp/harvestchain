import flask
import pymongo
import os
import uuid
import bcrypt
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from bson import SON
from datetime import datetime, timedelta
from dotenv import load_dotenv


load_dotenv()  # Load environment variables from .env file

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication


# Connect to MongoDB
url = os.environ.get("MONGODB_URL", "mongodb://localhost:27017")
client = MongoClient(url)
db = client[os.environ.get("MONGODB_DB_NAME", "harvestchain")]


# Collections
users = db["users"]
buyers = db["buyers"]
sellers = db["sellers"]
listings = db["listings"]
contracts = db["contracts"]
orders = db["orders"]
payments = db["payments"]
auditlogs = db["auditlogs"]
insurance_policies = db["insurance_policies"]
enrolled_policies = db["enrolled_policies"]
future_contracts = db["future_contracts"]


# -----------------------------
# AUTHENTICATION
# -----------------------------
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        user_type = data.get("type")
        name = data.get("name")

        if not all([email, password, user_type, name]):
            return jsonify({"error": "Missing required fields"}), 400

        # Check if user already exists
        existing_user = users.find_one({"email": email})
        if existing_user:
            return jsonify({"error": "User already exists"}), 409

        # Hash password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        # Create user document
        user_doc = {
            "_id": ObjectId(),
            "id": str(uuid.uuid4()),
            "email": email,
            "password": hashed_password,
            "name": name,
            "type": user_type,
            "did": f"did:example:{user_type.lower()}{str(uuid.uuid4())[:8]}",
            "wallet": {
                "address": f"0x{uuid.uuid4().hex[:40]}",
                "balance": 25000.50 if user_type == "FISHERMAN" else 150000.00
            },
            "createdAt": datetime.utcnow()
        }

        result = users.insert_one(user_doc)

        # Return user data without password
        user_data = {
            "id": user_doc["id"],
            "name": user_doc["name"],
            "type": user_doc["type"],
            "email": user_doc["email"],
            "did": user_doc["did"],
            "wallet": user_doc["wallet"]
        }

        return jsonify(user_data), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        user_type = data.get("type")

        if not all([email, user_type]):
            # Allow missing password for demo login
            password = data.get("password", "")

        # Try to find user in database only if password is provided
        user_doc = None
        if password:
            user_doc = users.find_one({"email": email, "type": user_type})

        if user_doc and bcrypt.checkpw(password.encode('utf-8'), user_doc["password"]):
            # Return user data without password
            user_data = {
                "id": user_doc["id"],
                "name": user_doc["name"],
                "type": user_doc["type"],
                "email": user_doc["email"],
                "did": user_doc["did"],
                "wallet": user_doc["wallet"]
            }
            return jsonify(user_data)

        # Fall back to mock login for demo purposes if no user found or no password
        if user_type == "FISHERMAN":
            user_data = {
                "id": str(uuid.uuid4()),
                "name": "Tom Fisher",
                "type": "FISHERMAN",
                "email": email,
                "did": "did:example:fisherman123",
                "wallet": {
                    "address": "0x742d35Cc6634C0532925a3b8D84E36137F1234c9",
                    "balance": 25000.50
                }
            }
        else:  # BUYER
            user_data = {
                "id": str(uuid.uuid4()),
                "name": "Global Fish Inc",
                "type": "BUYER",
                "email": email,
                "did": "did:example:buyer456",
                "wallet": {
                    "address": "0x8ba1f109551bD432803012645Hac136c0532925a",
                    "balance": 150000.00
                }
            }

        return jsonify(user_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -----------------------------
# FUTURE CONTRACTS
# -----------------------------
@app.route('/api/futures', methods=['POST'])
def create_future():
    try:
        data = request.get_json()

        future_contract = {
            "_id": ObjectId(),
            "id": str(uuid.uuid4()),
            "buyerId": data["buyerId"],
            "buyerName": data["buyerName"],
            "fishType": data["fishType"],
            "originalQuantityKg": data["originalQuantityKg"],
            "remainingQuantityKg": data["originalQuantityKg"],  # Initially same as original
            "pricePerKg": data["pricePerKg"],
            "deliveryDate": data["deliveryDate"],
            "status": "OPEN",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }

        result = future_contracts.insert_one(future_contract)
        future_contract["_id"] = str(result.inserted_id)

        return jsonify({"success": True, "contract": future_contract})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/futures/buyer/<buyer_name>', methods=['GET'])
def get_buyer_contracts(buyer_name):
    try:
        contracts_list = list(future_contracts.find({"buyerName": buyer_name}))

        # Convert ObjectId to string for JSON serialization
        for contract in contracts_list:
            contract["_id"] = str(contract["_id"])

        return jsonify(contracts_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/futures/user/<user_id>', methods=['GET'])
def get_user_posted_futures(user_id):
    try:
        contracts_list = list(future_contracts.find({"buyerId": user_id}))

        # Convert ObjectId to string for JSON serialization
        for contract in contracts_list:
            contract["_id"] = str(contract["_id"])

        return jsonify(contracts_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/futures/open', methods=['GET'])
def get_open_futures():
    try:
        contracts_list = list(future_contracts.find({
            "status": {"$in": ["OPEN", "PARTIALLY_ACCEPTED"]},
            "remainingQuantityKg": {"$gt": 0}
        }))
        
        # Convert ObjectId to string for JSON serialization
        for contract in contracts_list:
            contract["_id"] = str(contract["_id"])
        
        return jsonify(contracts_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/futures/<contract_id>/accept', methods=['POST'])
def accept_future_part(contract_id):
    try:
        data = request.get_json()
        user_id = data.get("userId")
        quantity = data.get("quantity")
        
        # Find the contract
        contract = future_contracts.find_one({"id": contract_id})
        if not contract:
            return jsonify({"error": "Contract not found"}), 404
        
        if quantity > contract["remainingQuantityKg"]:
            return jsonify({"error": "Quantity exceeds remaining amount"}), 400
        
        # Update remaining quantity
        new_remaining = contract["remainingQuantityKg"] - quantity
        new_status = "ACCEPTED" if new_remaining == 0 else "PARTIALLY_ACCEPTED"
        
        future_contracts.update_one(
            {"id": contract_id},
            {
                "$set": {
                    "remainingQuantityKg": new_remaining,
                    "status": new_status,
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        # Create accepted contract record
        accepted_contract = {
            "_id": ObjectId(),
            "id": str(uuid.uuid4()),
            "contractId": contract_id,
            "buyerName": contract["buyerName"],
            "fishType": contract["fishType"],
            "quantityKg": quantity,
            "pricePerKg": contract["pricePerKg"],
            "deliveryDate": contract["deliveryDate"],
            "status": "ACCEPTED",
            "fishermanId": user_id,
            "acceptedAt": datetime.utcnow()
        }
        
        result = contracts.insert_one(accepted_contract)
        
        return jsonify({"success": True, "message": "Contract accepted successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/futures/<contract_id>/cancel', methods=['POST'])
def cancel_future(contract_id):
    try:
        result = future_contracts.update_one(
            {"id": contract_id},
            {
                "$set": {
                    "status": "CANCELLED",
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            return jsonify({"error": "Contract not found"}), 404
        
        return jsonify({"success": True, "message": "Contract cancelled successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/contracts/fisherman/<fisherman_id>', methods=['GET'])
def get_fisherman_contracts(fisherman_id):
    try:
        fisherman_contracts = list(contracts.find({"fishermanId": fisherman_id}))
        
        # Convert ObjectId to string for JSON serialization
        for contract in fisherman_contracts:
            contract["_id"] = str(contract["_id"])
        
        return jsonify(fisherman_contracts)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/contracts/<contract_id>/decline', methods=['POST'])
def decline_contract(contract_id):
    try:
        result = contracts.update_one(
            {"id": contract_id},
            {
                "$set": {
                    "status": "DECLINED",
                    "declinedAt": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            return jsonify({"error": "Contract not found"}), 404
        
        return jsonify({"success": True, "message": "Contract declined"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -----------------------------
# INSURANCE & FINANCIAL SERVICES
# -----------------------------
@app.route('/api/insurance/policies', methods=['GET'])
def get_available_policies():
    try:
        # Mock insurance policies data
        policies = [
            {
                "id": "policy1",
                "name": "Weather Protection Insurance",
                "description": "Protects against weather-related fishing losses including storms and typhoons.",
                "premium": 2500,
                "coverage": 50000
            },
            {
                "id": "policy2",
                "name": "Equipment Damage Cover",
                "description": "Coverage for fishing equipment damage or theft while at sea.",
                "premium": 1800,
                "coverage": 30000
            },
            {
                "id": "policy3",
                "name": "Medical Emergency Insurance",
                "description": "Emergency medical coverage for injuries sustained during fishing activities.",
                "premium": 1200,
                "coverage": 25000
            }
        ]
        
        return jsonify(policies)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/insurance/enrolled/<user_id>', methods=['GET'])
def get_enrolled_policies(user_id):
    try:
        # Mock enrolled policies - in production, query from database
        enrolled = list(enrolled_policies.find({"userId": user_id}))
        
        # Convert ObjectId to string
        for policy in enrolled:
            policy["_id"] = str(policy["_id"])
        
        return jsonify(enrolled)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/insurance/enroll', methods=['POST'])
def enroll_in_policy():
    try:
        data = request.get_json()
        user_id = data.get("userId")
        policy_id = data.get("policyId")
        
        enrollment = {
            "_id": ObjectId(),
            "userId": user_id,
            "policyId": policy_id,
            "enrolledAt": datetime.utcnow(),
            "status": "ACTIVE"
        }
        
        result = enrolled_policies.insert_one(enrollment)
        
        return jsonify({"success": True, "message": "Successfully enrolled in policy"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/fisherman/credit-data/<fisherman_id>', methods=['GET'])
def get_fisherman_credit_data(fisherman_id):
    try:
        # Mock fisherman data for credit scoring
        fisherman_data = {
            "id": fisherman_id,
            "contractsCompleted": 15,
            "contractsDeclined": 2,
            "totalVolume": 2500,
            "onTimeDeliveries": 13,
            "averageRating": 4.3,
            "yearsActive": 3,
            "cooperativeMember": True,
            "certifications": ["Sustainable Fishing", "Safety Training"],
            "recentPerformance": "Good"
        }
        
        return jsonify(fisherman_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -----------------------------
# AI SERVICE ENDPOINTS 
# -----------------------------
@app.route('/api/ai/credit-score', methods=['POST'])
def calculate_credit_score():
    try:
        data = request.get_json()
        
        # Mock AI credit scoring logic
        completed = data.get("contractsCompleted", 0)
        declined = data.get("contractsDeclined", 0)
        on_time = data.get("onTimeDeliveries", 0)
        years_active = data.get("yearsActive", 0)
        rating = data.get("averageRating", 3.0)
        
        # Simple scoring algorithm
        base_score = 600
        completion_bonus = completed * 10
        decline_penalty = declined * 25
        experience_bonus = years_active * 20
        rating_bonus = (rating - 3.0) * 50
        
        final_score = base_score + completion_bonus - decline_penalty + experience_bonus + rating_bonus
        final_score = max(300, min(850, final_score))  # Clamp between 300-850
        
        # Generate factors
        positive_factors = []
        negative_factors = []
        
        if completed >= 10:
            positive_factors.append("High completion rate")
        if on_time >= completed * 0.8:
            positive_factors.append("Excellent delivery record")
        if years_active >= 2:
            positive_factors.append("Experienced fisherman")
        if rating >= 4.0:
            positive_factors.append("High buyer satisfaction")
            
        if declined >= 3:
            negative_factors.append("Multiple declined contracts")
        if on_time < completed * 0.6:
            negative_factors.append("Poor delivery timeliness")
            
        # Generate mock history
        history = []
        for i in range(6):
            month_score = final_score + (i - 3) * 15 + (i * 5)
            month_score = max(300, min(850, month_score))
            history.append({
                "month": f"2024-{str(7+i).zfill(2)}",
                "score": int(month_score)
            })
        
        credit_data = {
            "score": int(final_score),
            "factors": {
                "positive": positive_factors,
                "negative": negative_factors
            },
            "history": history
        }
        
        return jsonify(credit_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/ai/price-recommendation', methods=['POST'])
def get_price_recommendation():
    try:
        data = request.get_json()
        fish_type = data.get("fishType")
        season = data.get("season")
        location = data.get("location")
        
        # Mock AI price recommendation
        base_prices = {
            "Tuna (Yellowfin)": 280,
            "Grouper (Lapu-Lapu)": 350,
            "Mackerel (Galunggong)": 120,
            "Sardines": 80
        }
        
        base_price = base_prices.get(fish_type, 200)
        
        # Seasonal adjustments
        if season == "Peak Season":
            price_adjustment = 1.2
            season_note = "Peak season pricing - demand is high"
        else:
            price_adjustment = 0.9
            season_note = "Off-peak season - consider competitive pricing"
        
        # Regional adjustments
        regional_multiplier = {
            "Mindoro": 1.0,
            "Palawan": 1.1,
            "General Santos": 0.95
        }.get(location, 1.0)
        
        recommended_price = int(base_price * price_adjustment * regional_multiplier)
        
        recommendation = f"""Based on current market analysis for {fish_type}:

📊 **Recommended Price Range:** ₱{recommended_price-20} - ₱{recommended_price+20} per kg

🔍 **Market Analysis:**
• {season_note}
• Regional market factor for {location}: {regional_multiplier:.1f}x
• Current average market price: ₱{base_price}/kg

💡 **Pricing Strategy:**
• Consider starting at ₱{recommended_price}/kg
• Monitor buyer response and adjust accordingly
• Factor in your fish quality and freshness

⚠️ **Market Conditions:**
• Demand for {fish_type} is {"strong" if price_adjustment > 1 else "moderate"}
• Price volatility expected due to {"seasonal factors" if season == "Peak Season" else "supply variations"}
"""
        
        return jsonify({"recommendation": recommendation})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -----------------------------
# HEALTH CHECK
# -----------------------------
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    })


# -----------------------------
# ERROR HANDLERS
# -----------------------------
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500


# -----------------------------
# Run Server
# -----------------------------
if __name__ == "__main__":
    print("🐟 Starting HarvestChain Backend...")
    print("📡 Server running on: http://localhost:5000")
    print("📋 API Health Check: http://localhost:5000/api/health")
    print("🛑 Press CTRL+C to stop")
    
    # Check if MongoDB is needed
    try:
        mongo_url = os.environ.get("MONGODB_URL", "mongodb://localhost:27017")
        test_client = MongoClient(mongo_url, serverSelectionTimeoutMS=2000)
        test_client.server_info()  # Test connection
        print("✅ MongoDB connection successful")
    except Exception as e:
        print("⚠️  MongoDB connection failed. Running without database.")
        print(f"   Error: {e}")
    
    app.run(host='0.0.0.0', port=5000, debug=True)