from backend.tests.helpers import login


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
