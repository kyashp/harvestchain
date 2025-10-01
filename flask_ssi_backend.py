from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import datetime
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa


app = Flask(__name__)
CORS(app)

# In-memory storage for demo purposes

users = {}

# ---------------------------
# STEP 1: User generates DID
# ---------------------------
def generate_did():
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    public_key = private_key.public_key()

    priv_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption()
    )
    pub_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )

    did = f"did:example:{hash(pub_pem) % 100000}"
    return did, private_key, pub_pem

# ---------------------------
# STEP 2: Issuer issues credential
# ---------------------------
def issue_credential(issuer_priv, issuer_did, subject_did, claim):
    credential = {
        "id": subject_did,
        "issuer": issuer_did,
        "issued": str(datetime.datetime.utcnow()),
        "credential": claim
    }

    message = json.dumps(credential, sort_keys=True).encode()
    signature = issuer_priv.sign(
        message,
        padding.PKCS1v15(),
        hashes.SHA256()
    )
    credential["signature"] = signature.hex()
    return credential

# ---------------------------
# STEP 3: Verifier checks credential
# ---------------------------
def verify_credential(credential, issuer_pub):
    signature = bytes.fromhex(credential["signature"])
    unsigned_cred = credential.copy()
    del unsigned_cred["signature"]

    message = json.dumps(unsigned_cred, sort_keys=True).encode()

    try:
        issuer_pub.verify(
            signature,
            message,
            padding.PKCS1v15(),
            hashes.SHA256()
        )
        return True
    except Exception:
        return False

# Initialize issuer keys and DID
issuer_did, issuer_priv, issuer_pub = generate_did()

@app.route('/generate_did', methods=['POST'])
def api_generate_did():
    user_id = request.json.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    did, priv, pub = generate_did()
    users[user_id] = {
        "did": did,
        "private_key": priv,
        "public_key": pub,
        "credential": None
    }
    return jsonify({"did": did})

@app.route('/issue_credential', methods=['POST'])
def api_issue_credential():
    user_id = request.json.get('user_id')
    claim = request.json.get('claim')
    if not user_id or not claim:
        return jsonify({"error": "user_id and claim are required"}), 400
    user = users.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    credential = issue_credential(issuer_priv, issuer_did, user["did"], claim)
    user["credential"] = credential
    return jsonify(credential)

@app.route('/verify_credential', methods=['POST'])
def api_verify_credential():
    credential = request.json.get('credential')
    if not credential:
        return jsonify({"error": "credential is required"}), 400
    is_valid = verify_credential(credential, issuer_pub)
    return jsonify({"valid": is_valid})

@app.route('/get_user_info', methods=['GET'])
def api_get_user_info():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    user = users.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({
        "did": user["did"],
        "credential": user["credential"]
    })

@app.route('/')
def home():
    return "Flask SSI Backend is running."
if __name__ == '__main__':
    app.run(port=5000, debug=True)

