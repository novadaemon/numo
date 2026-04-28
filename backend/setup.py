"""
Setup configuration for Numo backend.
"""

import os
from pathlib import Path
from setuptools import setup, find_packages

# Obtener la versión del archivo central
def get_version():
    version_file = Path(__file__).parent.parent / ".version"
    if version_file.exists():
        return version_file.read_text(encoding="utf-8").strip()
    return "0.0.0"

setup(
    name="numo-backend",
    version=get_version(),
    description="Numo - Personal Expense Tracker Backend",
    author="Your Team",
    packages=find_packages(),
    python_requires=">=3.11",
    include_package_data=True,
)
