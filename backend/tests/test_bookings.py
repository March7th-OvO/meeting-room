from datetime import datetime

from backend.tests.helpers import login
from app.services import bookings as booking_service


def test_user_booking_flow_and_admin_approval(client):
    user_token = login(client, "user1")
    admin_token = login(client, "admin")

    create_response = client.post(
        "/api/v1/bookings",
        headers={"Authorization": f"Bearer {user_token}"},
        json={
            "room_id": 1,
            "booking_date": "2026-06-10",
            "start_time": "10:00:00",
            "end_time": "11:00:00",
            "purpose": "Sprint planning",
        },
    )

    assert create_response.status_code == 200
    booking = create_response.json()["data"]
    assert booking["status"] == "pending"

    my_bookings = client.get(
        "/api/v1/bookings/me",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert my_bookings.status_code == 200
    assert any(item["id"] == booking["id"] for item in my_bookings.json()["data"])

    admin_bookings = client.get(
        "/api/v1/admin/bookings",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert admin_bookings.status_code == 200
    assert any(item["id"] == booking["id"] for item in admin_bookings.json()["data"])

    approval_response = client.patch(
        f"/api/v1/admin/bookings/{booking['id']}/status",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"status": "approved", "approval_comment": "Looks good"},
    )
    assert approval_response.status_code == 200
    assert approval_response.json()["data"]["status"] == "approved"


def test_booking_conflict_is_rejected(client):
    user_token = login(client, "user1")
    admin_token = login(client, "admin")

    first = client.post(
        "/api/v1/bookings",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "room_id": 2,
            "booking_date": "2026-06-11",
            "start_time": "14:00:00",
            "end_time": "15:00:00",
            "purpose": "Approved booking",
        },
    )
    assert first.status_code == 200
    assert first.json()["data"]["status"] == "approved"

    second = client.post(
        "/api/v1/bookings",
        headers={"Authorization": f"Bearer {user_token}"},
        json={
            "room_id": 2,
            "booking_date": "2026-06-11",
            "start_time": "14:30:00",
            "end_time": "15:30:00",
            "purpose": "Conflicting booking",
        },
    )

    assert second.status_code == 409


def test_booking_for_maintenance_room_is_rejected(client):
    user_token = login(client, "user1")

    response = client.post(
        "/api/v1/bookings",
        headers={"Authorization": f"Bearer {user_token}"},
        json={
            "room_id": 4,
            "booking_date": "2026-06-12",
            "start_time": "09:00:00",
            "end_time": "10:00:00",
            "purpose": "Maintenance conflict",
        },
    )

    assert response.status_code == 400


def test_booking_owner_can_cancel(client):
    user_token = login(client, "user2")

    create_response = client.post(
        "/api/v1/bookings",
        headers={"Authorization": f"Bearer {user_token}"},
        json={
            "room_id": 3,
            "booking_date": "2026-06-13",
            "start_time": "16:00:00",
            "end_time": "17:00:00",
            "purpose": "Cancel test",
        },
    )
    booking_id = create_response.json()["data"]["id"]

    cancel_response = client.patch(
        f"/api/v1/bookings/{booking_id}/cancel",
        headers={"Authorization": f"Bearer {user_token}"},
    )

    assert cancel_response.status_code == 200
    assert cancel_response.json()["data"]["status"] == "cancelled"


def test_booking_list_filters_work_for_user_and_admin(client):
    user_token = login(client, "user1")
    admin_token = login(client, "admin")

    user_filtered = client.get(
        "/api/v1/bookings/me?status=approved&booking_date_from=2026-06-07&booking_date_to=2026-06-07",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert user_filtered.status_code == 200
    user_data = user_filtered.json()["data"]
    assert len(user_data) == 1
    assert user_data[0]["status"] == "approved"

    admin_filtered = client.get(
        "/api/v1/admin/bookings?status=pending&room_id=1&booking_date_from=2026-06-08&booking_date_to=2026-06-08",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert admin_filtered.status_code == 200
    admin_data = admin_filtered.json()["data"]
    assert len(admin_data) == 1
    assert admin_data[0]["room_id"] == 1
    assert admin_data[0]["status"] == "pending"


def test_booking_for_past_time_today_is_rejected(client, monkeypatch):
    user_token = login(client, "user1")

    class FixedDateTime(datetime):
        @classmethod
        def now(cls, tz=None):
            return cls(2026, 6, 7, 15, 0, 0, tzinfo=tz)

    monkeypatch.setattr(booking_service, "datetime", FixedDateTime)

    response = client.post(
        "/api/v1/bookings",
        headers={"Authorization": f"Bearer {user_token}"},
        json={
            "room_id": 3,
            "booking_date": "2026-06-07",
            "start_time": "14:00:00",
            "end_time": "14:30:00",
            "purpose": "Past slot",
        },
    )

    assert response.status_code == 400


def test_admin_booking_status_rejects_invalid_value(client):
    admin_token = login(client, "admin")

    response = client.patch(
        "/api/v1/admin/bookings/2/status",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"status": "cancelled"},
    )

    assert response.status_code == 422
