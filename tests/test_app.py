import pytest

from fastapi.testclient import TestClient

from src.app import activities

# If needed, we could import the app here for more direct access, but the
# ``client`` fixture already wraps it.  Just keep activities available.


# tests rely on the ``client`` fixture defined in conftest.py

def test_get_activities(client: TestClient):
    resp = client.get("/activities")
    assert resp.status_code == 200
    assert resp.json() == activities


def test_signup_success(client: TestClient):
    email = "newstudent@mergington.edu"
    resp = client.post(
        "/activities/Chess Club/signup",
        params={"email": email},
    )
    assert resp.status_code == 200
    assert email in activities["Chess Club"]["participants"]
    assert "Signed up" in resp.json().get("message", "")


def test_signup_duplicate(client: TestClient):
    # use one of the pre-populated emails
    existing = activities["Chess Club"]["participants"][0]
    resp = client.post(
        "/activities/Chess Club/signup",
        params={"email": existing},
    )
    assert resp.status_code == 400
    assert "already signed up" in resp.json().get("detail", "")


def test_signup_nonexistent_activity(client: TestClient):
    resp = client.post(
        "/activities/DoesNotExist/signup",
        params={"email": "foo@bar.com"},
    )
    assert resp.status_code == 404
    assert "Activity not found" in resp.json().get("detail", "")


def test_remove_participant_success(client: TestClient):
    # pick an existing participant from Chess Club
    email = activities["Chess Club"]["participants"][0]
    resp = client.delete(
        "/activities/Chess Club/participants",
        params={"email": email},
    )
    assert resp.status_code == 200
    assert email not in activities["Chess Club"]["participants"]
    assert "Removed" in resp.json().get("message", "")


def test_remove_participant_not_found(client: TestClient):
    resp = client.delete(
        "/activities/Chess Club/participants",
        params={"email": "nonexistent@mergington.edu"},
    )
    assert resp.status_code == 404
    assert "Participant not found" in resp.json().get("detail", "")


def test_remove_participant_activity_not_found(client: TestClient):
    resp = client.delete(
        "/activities/DoesNotExist/participants",
        params={"email": "foo@bar.com"},
    )
    assert resp.status_code == 404
    assert "Activity not found" in resp.json().get("detail", "")
