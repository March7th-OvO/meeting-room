from fastapi.testclient import TestClient


def login(client: TestClient, username: str, password: str = "123456") -> str:
    response = client.post(
        "/api/v1/auth/login",
        json={"username": username, "password": password},
    )
    assert response.status_code == 200
    return response.json()["data"]["access_token"]
