from os import urandom
from base64 import b64encode, b64decode

def generate_ssha_password(p):
    p = str(p).strip()
    salt = urandom(8)
    try:
        from hashlib import sha1
        pw = sha1(p)
    except ImportError:
        import sha
        pw = sha.new(p)
    pw.update(salt)
    return "{SSHA}" + b64encode(pw.digest() + salt)

def generate_ssha512_password(p):
    """Generate salted SHA512 password with prefix '{SSHA512}'.
    Return salted SHA hash if python is older than 2.5 (module hashlib)."""
    p = str(p).strip()
    try:
        from hashlib import sha512
        salt = urandom(8)
        pw = sha512(p)
        pw.update(salt)
        return "{SSHA512}" + b64encode(pw.digest() + salt)
    except ImportError:
        # Use SSHA password instead if python is older than 2.5.
        return generate_ssha_password(p)

