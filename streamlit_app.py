"""
Geriye uyumluluk: `streamlit run streamlit_app.py` de çalışır.
Asıl uygulama: main.py
"""
from pathlib import Path
import runpy

runpy.run_path(str(Path(__file__).resolve().with_name("main.py")), run_name="__main__")
