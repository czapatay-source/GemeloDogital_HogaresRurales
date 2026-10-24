"""
API and contract verification tests using FastAPI TestClient.
"""

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["countries_supported"] == 13


def test_data_catalog_endpoint():
    response = client.get("/api/v1/data/catalog")
    assert response.status_code == 200
    data = response.json()
    assert "ARG" in data["countries"]
    assert "PER" in data["countries"]
    assert len(data["sources"]) > 0


def test_simulation_execution_contract():
    payload = {
        "country_code": "PER",
        "policy_type": "conditional",
        "base_amount_usd_ppp": 75.0,
        "child_supplement_usd_ppp": 25.0,
        "elderly_supplement_usd_ppp": 35.0,
        "target_criterion": "children_households",
        "enforce_school_attendance": True,
        "climate_shock_type": "none"
    }
    response = client.post("/api/v1/simulations/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "poverty_reduction_pp" in data
    assert "annual_fiscal_cost_usd_ppp" in data
    assert data["country"] == "PER"
