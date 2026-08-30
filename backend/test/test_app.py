from starlette.testclient import TestClient


def test_app(client: TestClient):
    res = client.get('/api/health')
    assert res.status_code == 200


def test_rsvp_can_be_saved_and_loaded(client: TestClient):
    response = client.post('/api/rsvp', json={
        'familyName': 'Familien Hansen',
        'email': 'hansen@example.no',
        'attending': 'yes',
        'guestCount': 3,
        'guestNames': 'Ola\nKari\nLiv',
        'dietaryNeeds': 'Vegetar',
        'message': 'Vi gleder oss!',
    })

    assert response.status_code == 200
    assert 'wedding_rsvp_session' in response.cookies

    saved_response = client.get('/api/rsvp')
    assert saved_response.status_code == 200
    assert saved_response.json()['familyName'] == 'Familien Hansen'


def test_rsvp_requires_a_valid_email(client: TestClient):
    response = client.post('/api/rsvp', json={
        'familyName': 'Familien Hansen',
        'email': 'not-an-email',
        'attending': 'no',
        'guestCount': 1,
        'guestNames': '',
        'dietaryNeeds': '',
        'message': '',
    })

    assert response.status_code == 422
