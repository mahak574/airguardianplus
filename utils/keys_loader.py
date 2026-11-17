import os
import streamlit as st
from dotenv import load_dotenv

# Find project root
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
env_path = os.path.join(project_root, '.env')

# Load env file with override=True to ensure it overrides system defaults
load_dotenv(dotenv_path=env_path, override=True)

def get_api_key(name):
    # 1. Try Streamlit Secrets (for production deployment / community cloud)
    try:
        if st.secrets and name in st.secrets:
            val = st.secrets[name]
            if val:
                return val
    except Exception:
        pass

    # 2. Fall back to environment variable loaded from OS / .env
    return os.getenv(name)

