*** Settings ***
Library    RequestsLibrary
Library    Collections
Library    String
Suite Setup    Run Keywords    Check API Health    AND    Generate Unique Email

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

Generate Unique Email
    [Documentation]    Create unique email for each test run
    ${suffix}=    Generate Random String    10    [LOWER]
    ${email}=    Set Variable    e2e-test-${suffix}@test.com
    Set Suite Variable    ${TEST_EMAIL}    ${email}
    Log    Using email: ${TEST_EMAIL}

*** Test Cases ***
User Can Register
    [Documentation]    Test user registration with valid email and password
    Create Session    api    ${BASE_URL}    verify=False
    ${payload}=    Create Dictionary    email=${TEST_EMAIL}    password=${TEST_PASSWORD}
    ${response}=    POST On Session    api    /auth/register
    ...    json=${payload}
    ...    headers={"Content-Type": "application/json"}
    ...    expected_status=any

    Log    Response Status: ${response.status_code}
    Log    Response Body: ${response.text}
    Should Be Equal As Integers    ${response.status_code}    201
    ${body}=    Get From Dictionary    ${response.json()}    access_token
    Should Not Be Empty    ${body}

User Can Login
    [Documentation]    Test user login with registered credentials
    Create Session    api    ${BASE_URL}    verify=False
    ${payload}=    Create Dictionary    email=${TEST_EMAIL}    password=${TEST_PASSWORD}
    ${response}=    POST On Session    api    /auth/login
    ...    json=${payload}
    ...    headers={"Content-Type": "application/json"}
    ...    expected_status=any

    Log    Response Status: ${response.status_code}
    Log    Response Body: ${response.text}
    Should Be Equal As Integers    ${response.status_code}    200
    ${body}=    Get From Dictionary    ${response.json()}    access_token
    Should Not Be Empty    ${body}

User Cannot Login With Wrong Password
    [Documentation]    Test login fails with invalid credentials
    Create Session    api    ${BASE_URL}    verify=False
    ${payload}=    Create Dictionary    email=${TEST_EMAIL}    password=WrongPassword999
    ${response}=    POST On Session    api    /auth/login
    ...    json=${payload}
    ...    headers={"Content-Type": "application/json"}
    ...    expected_status=any

    Log    Response Status: ${response.status_code}
    Log    Response Body: ${response.text}
    Should Be Equal As Integers    ${response.status_code}    401