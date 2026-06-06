def test_seeded_user_can_login_and_fetch_profile(client):
    login_response = client.post(
        "/api/v1/auth/login",
        json={"username": "admin", "password": "123456"},
    )

    assert login_response.status_code == 200

    payload = login_response.json()
    assert payload["code"] == 0
    assert payload["data"]["user"]["username"] == "admin"
    assert payload["data"]["user"]["role"] == "admin"
    assert payload["data"]["access_token"]

    token = payload["data"]["access_token"]
    me_response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert me_response.status_code == 200
    assert me_response.json()["data"]["username"] == "admin"
