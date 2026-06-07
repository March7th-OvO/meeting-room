from datetime import date, time

from backend.tests.helpers import login
from app.db.session import get_session_local
from app.models import Booking, Room, User


def test_admin_statistics_endpoints_return_data(client):
    admin_token = login(client, "admin")
    headers = {"Authorization": f"Bearer {admin_token}"}

    overview = client.get("/api/v1/admin/statistics/overview", headers=headers)
    usage = client.get("/api/v1/admin/statistics/room-usage", headers=headers)
    status = client.get("/api/v1/admin/statistics/room-status", headers=headers)

    assert overview.status_code == 200
    assert usage.status_code == 200
    assert status.status_code == 200

    overview_data = overview.json()["data"]
    assert overview_data["room_count"] >= 4
    assert overview_data["approved_booking_count"] >= 1
    assert overview_data["pending_booking_count"] >= 1

    assert isinstance(usage.json()["data"], list)
    status_data = status.json()["data"]
    assert isinstance(status_data, list)
    assert {item["name"] for item in status_data} == {"available", "maintenance"}
    assert next(item["value"] for item in status_data if item["name"] == "available") >= 1


def test_room_usage_returns_top_five_rooms_sorted_by_usage(client):
    with get_session_local()() as db:
        user = db.query(User).filter(User.username == "admin").one()
        extra_rooms = [
            Room(name=f"Top Room {index}", capacity=6 + index, status="available")
            for index in range(1, 7)
        ]
        db.add_all(extra_rooms)
        db.flush()

        booking_counts = [6, 5, 4, 3, 2, 1]
        for room, booking_count in zip(extra_rooms, booking_counts, strict=True):
            for booking_index in range(booking_count):
                db.add(
                    Booking(
                        room_id=room.id,
                        user_id=user.id,
                        booking_date=date(2026, 7, min(booking_index + 1, 28)),
                        start_time=time(9, 0),
                        end_time=time(10, 0),
                        status="approved",
                        purpose=f"Usage seed {booking_index}",
                        approved_by=user.id,
                    )
                )
        db.commit()

    admin_token = login(client, "admin")
    response = client.get(
        "/api/v1/admin/statistics/room-usage",
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    assert response.status_code == 200
    usage_data = response.json()["data"]
    assert len(usage_data) == 5
    assert [item["name"] for item in usage_data] == [
        "Top Room 1",
        "Top Room 2",
        "Top Room 3",
        "Top Room 4",
        "Top Room 5",
    ]
    assert [item["value"] for item in usage_data] == [6, 5, 4, 3, 2]


def test_current_room_usage_returns_in_use_reviewing_and_idle_counts(client, monkeypatch):
    with get_session_local()() as db:
        admin = db.query(User).filter(User.username == "admin").one()
        tracked_rooms = [
            Room(name="Live Room", capacity=10, status="available"),
            Room(name="Review Room", capacity=10, status="available"),
            Room(name="Idle Room", capacity=10, status="available"),
        ]
        db.add_all(tracked_rooms)
        db.flush()

        db.add_all(
            [
                Booking(
                    room_id=tracked_rooms[0].id,
                    user_id=admin.id,
                    booking_date=date.today(),
                    start_time=time(0, 0),
                    end_time=time(23, 59),
                    status="approved",
                    purpose="Live usage",
                    approved_by=admin.id,
                ),
                Booking(
                    room_id=tracked_rooms[1].id,
                    user_id=admin.id,
                    booking_date=date.today(),
                    start_time=time(0, 0),
                    end_time=time(23, 59),
                    status="pending",
                    purpose="Review usage",
                ),
            ]
        )
        db.commit()

    admin_token = login(client, "admin")
    response = client.get(
        "/api/v1/admin/statistics/current-room-usage",
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    assert response.status_code == 200
    data = response.json()["data"]
    assert data == [
        {"name": "in_use", "value": 1},
        {"name": "under_review", "value": 1},
        {"name": "idle", "value": 5},
    ]
