from backend.tests.helpers import login


def test_login_rejects_invalid_password(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "admin", "password": "wrong-password"},
    )

    assert response.status_code == 401


def test_me_requires_token(client):
    response = client.get("/api/v1/auth/me")

    assert response.status_code == 401


def test_user_cannot_access_admin_routes(client):
    token = login(client, "user1")
    response = client.get(
        "/api/v1/admin/bookings",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 403
