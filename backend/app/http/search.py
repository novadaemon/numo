"""Helpers for name search endpoints."""
import unicodedata


def normalize_text(text):
    """Remove accents and convert to lowercase for accent-insensitive search."""
    if not text:
        return ''
    # Normalize Unicode to NFD (decomposed form)
    nfd = unicodedata.normalize('NFD', text)
    # Filter out combining characters (accents)
    return ''.join(char for char in nfd if unicodedata.category(char) != 'Mn').lower()
