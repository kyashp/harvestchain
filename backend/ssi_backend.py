import json
import datetime
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa

# ---------------------------
# STEP 1: User generates DID
# ---------------------------
def generate_did():
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    public_key = private_key.public_key()

    # Export keys in PEM format
    priv_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption()
    )
    pub_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )

    did = f"did:example:{hash(pub_pem) % 100000}"  # fake DID from hash
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

    # Sign credential
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

# ---------------------------
# DEMO RUN
# ---------------------------

# User generates DID
user_did, user_priv, user_pub = generate_did()
print("User DID:", user_did)

# Issuer generates DID
issuer_did, issuer_priv, issuer_pub = generate_did()
print("Issuer DID:", issuer_did)

# Issuer issues credential (e.g. "User is 18+")
claim = {"type": "AgeCredential", "claim": "User is over 18"}
credential = issue_credential(issuer_priv, issuer_did, user_did, claim)
print("\nCredential Issued:", json.dumps(credential, indent=2))

# Verifier checks credential
is_valid = verify_credential(credential, issuer_pub)
print("\nVerification result:", "✅ Valid" if is_valid else "❌ Invalid")
