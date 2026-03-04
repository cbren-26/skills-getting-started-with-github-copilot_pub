import copy
import pytest
from fastapi.testclient import TestClient

# import the FastAPI app object and the mutable activities dictionary
from src.app import app as fastapi_app, activities


@pytest.fixture
def client():
    """Return a TestClient bound to the FastAPI app.

    ``app`` must be the FastAPI instance, not the module object. We
    imported it above as ``fastapi_app`` to avoid confusion.
    """
    return TestClient(fastapi_app)


@pytest.fixture(autouse=True)
def reset_activities():
    """Restore the in-memory activities dict before/after each test.

    This fixture is marked ``autouse`` so tests do not need to request it
    explicitly. Any mutation performed by the API (signup/remove) is wiped
    out when the test finishes, preventing cross-test pollution.
    """
    original = copy.deepcopy(activities)
    yield
    activities.clear()
    activities.update(copy.deepcopy(original))
