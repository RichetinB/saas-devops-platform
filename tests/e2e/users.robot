*** Settings ***
Library    RequestsLibrary
Library    Collections
Library    String
Suite Setup    Run Keywords    Check API Health    AND    Register Test User And Get Token

*** Variables ***
${BASE_URL}    http://localhost:3001
${TEST_PASSWORD}    TestPassword123

*** Keywords ***
Check API Health
    [Documentation]    Verify API is running before tests
    TRY
        ${response}=    GET    ${BASE_URL}/health
        Should Be Equal As Integers    ${response.status_code}    200
    EXCEPT
        FAIL    API is not running at ${BASE_URL}. Please start the API server.
    END

Register Test User And Get Token
    [Documentation]    Register a unique test user and store the JWT token for the suite
    ${suffix}=    Generate Random String    10    [LOWER]
    ${email}=    Set Variable    users-e2e-${suffix}@test.com
    ${payload}=    Create Dictionary    email=${email}    password=${TEST_PASSWORD}
    Create Session    api    ${BASE_URL}    verify=False
    ${response}=    POST On Session    api    /auth/register
    ...    json=${payload}
    ...    expected_status=201
    ${token}=    Get From Dictionary    ${response.json()}    access_token
    Set Suite Variable    ${AUTH_TOKEN}    ${token}
    Log    Registered test user: ${email}

*** Test Cases ***
Authenticated User Can List Users
    [Documentation]    An authenticated user can list all users
    ${headers}=    Create Dictionary    Authorization=Bearer ${AUTH_TOKEN}
    ${response}=    GET On Session    api    /users    headers=${headers}    expected_status=200
    Log    Response Body: ${response.text}
    ${users}=    Set Variable    ${response.json()}
    Should Be True    isinstance($users, list)
    Should Be True    len($users) >= 1

Cannot Access Users Without Token
    [Documentation]    Unauthenticated request to users endpoint returns 401
    ${response}=    GET On Session    api    /users    expected_status=401
    Log    Response Body: ${response.text}
