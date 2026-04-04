"""Pagination utilities for API endpoints."""
from typing import Tuple


# Valid page sizes
ALLOWED_PAGE_SIZES = {10, 25, 50, 100}
DEFAULT_PAGE = 0
DEFAULT_PAGE_SIZE = 10


def validate_pagination_params(
    page: any = None,
    size: any = None,
) -> Tuple[int, int, str | None]:
    """
    Validate and return pagination parameters.
    
    Args:
        page: The page number (0-indexed)
        size: The page size
        
    Returns:
        Tuple of (page, size, error_message)
        error_message is None if valid, contains error description if invalid
    """
    # Parse page
    if page is None:
        page = DEFAULT_PAGE
    else:
        try:
            page = int(page)
            if page < 0:
                return None, None, "page must be >= 0"
        except (ValueError, TypeError):
            return None, None, "page must be an integer"
    
    # Parse size
    if size is None:
        size = DEFAULT_PAGE_SIZE
    else:
        try:
            size = int(size)
            if size not in ALLOWED_PAGE_SIZES:
                return None, None, f"size must be one of {sorted(ALLOWED_PAGE_SIZES)}"
        except (ValueError, TypeError):
            return None, None, "size must be an integer"
    
    return page, size, None


def apply_pagination(query, page: int, size: int):
    """
    Apply pagination to a SQLAlchemy query.
    
    Args:
        query: SQLAlchemy query object
        page: Page number (0-indexed)
        size: Page size
        
    Returns:
        Paginated query
    """
    offset = page * size
    return query.offset(offset).limit(size)
