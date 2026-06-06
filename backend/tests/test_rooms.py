from backend.tests.helpers import login


def test_authenticated_user_can_list_rooms(client):
    token = login(client, "user1")

    response = client.get(
        "/api/v1/rooms",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) >= 4
    assert any(room["name"] == "Boardroom A" for room in data)


def test_admin_can_create_update_and_delete_room(client):
    admin_token = login(client, "admin")
    headers = {"Authorization": f"Bearer {admin_token}"}

    create_response = client.post(
        "/api/v1/admin/rooms",
        headers=headers,
        json={
            "name": "Focus Room E",
            "capacity": 6,
            "status": "available",
            "location": "Floor 3",
            "description": "Quiet room",
            "equipment": ["Monitor", "Whiteboard"],
        },
    )

    assert create_response.status_code == 200
    room = create_response.json()["data"]
    assert room["name"] == "Focus Room E"

    update_response = client.patch(
        f"/api/v1/admin/rooms/{room['id']}",
        headers=headers,
        json={"status": "maintenance", "capacity": 8, "equipment": ["Monitor"]},
    )

    assert update_response.status_code == 200
    assert update_response.json()["data"]["status"] == "maintenance"
    assert update_response.json()["data"]["capacity"] == 8

    delete_response = client.delete(
        f"/api/v1/admin/rooms/{room['id']}",
        headers=headers,
    )

    assert delete_response.status_code == 200


def test_user_cannot_create_room(client):
    token = login(client, "user1")

    response = client.post(
        "/api/v1/admin/rooms",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "Invalid Room",
            "capacity": 2,
            "status": "available",
            "equipment": [],
        },
    )

    assert response.status_code == 403


def test_admin_cannot_create_room_with_invalid_status(client):
    admin_token = login(client, "admin")

    response = client.post(
        "/api/v1/admin/rooms",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "name": "Broken Room",
            "capacity": 2,
            "status": "offline",
            "equipment": [],
        },
    )

    assert response.status_code == 422


def test_admin_cannot_delete_room_with_active_bookings(client):
    admin_token = login(client, "admin")

    response = client.delete(
        "/api/v1/admin/rooms/1",
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    assert response.status_code == 400
